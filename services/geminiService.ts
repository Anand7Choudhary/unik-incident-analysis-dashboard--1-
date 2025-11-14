// This service uses the Groq API to generate insights from incident data.
import Groq from 'groq-sdk';
import { ProcessedIncident } from "../types";

const summarizeDataForPrompt = (incidents: ProcessedIncident[]): string => {
  if (incidents.length === 0) {
    return "NO_DATA";
  }

  const createCounts = (key: keyof Pick<ProcessedIncident, 'incidentCategory' | 'team' | 'seriousnessScore' | 'fundingSource'>) => {
    return incidents.reduce((acc, i) => {
      const value = i[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const formatCounts = (title: string, data: Record<string, number>): string => {
    const sortedEntries = Object.entries(data).sort(([, a], [, b]) => b - a);
    if (sortedEntries.length === 0) return "";
    const lines = sortedEntries.map(([key, value]) => `- ${key}: ${value}`);
    return `${title}:\n${lines.join('\n')}`;
  };

  const monthlyBreakdown: Record<string, Record<string, number>> = {};
  incidents.forEach(i => {
    const monthKey = `${i.incidentDate.getFullYear()}-${String(i.incidentDate.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyBreakdown[monthKey]) {
      monthlyBreakdown[monthKey] = {};
    }
    const category = i.incidentCategory;
    monthlyBreakdown[monthKey][category] = (monthlyBreakdown[monthKey][category] || 0) + 1;
  });

  const sortedMonthKeys = Object.keys(monthlyBreakdown).sort();
  const monthlyBreakdownString = "Incidents per Month (by category):\n" + sortedMonthKeys.map(key => {
    const categories = monthlyBreakdown[key];
    const categoryString = Object.entries(categories).map(([cat, count]) => `${cat}: ${count}`).join(', ');
    return `- ${key}: ${categoryString}`;
  }).join('\n');

  const createAvgSeriousnessMap = (key: keyof Pick<ProcessedIncident, 'team' | 'incidentCategory'>) => {
    const seriousnessMap: Record<string, { totalScore: number; count: number }> = {};
    incidents.forEach(i => {
      const value = i[key] as string;
      if (!seriousnessMap[value]) {
        seriousnessMap[value] = { totalScore: 0, count: 0 };
      }
      seriousnessMap[value].totalScore += i.seriousnessScore;
      seriousnessMap[value].count += 1;
    });
    const avgSeriousnessMap: Record<string, string> = {};
    for (const item in seriousnessMap) {
      avgSeriousnessMap[item] = (seriousnessMap[item].totalScore / seriousnessMap[item].count).toFixed(2);
    }
    const sortedEntries = Object.entries(avgSeriousnessMap).sort(([, a], [, b]) => parseFloat(b) - parseFloat(a));
    return sortedEntries;
  };

  const formatAvgSeriousness = (title: string, data: [string, string][]): string => {
    if (data.length === 0) return "";
    const lines = data.map(([key, value]) => `- ${key}: ${value}`);
    return `${title}:\n${lines.join('\n')}`;
  };

  const summaryParts = [
    `Total Incidents: ${incidents.length}`,
    formatCounts('By Category', createCounts('incidentCategory')),
    formatCounts('By Team', createCounts('team')),
    formatCounts('By Seriousness', createCounts('seriousnessScore')),
    monthlyBreakdownString,
    formatAvgSeriousness('Average Seriousness by Team', createAvgSeriousnessMap('team')),
    formatAvgSeriousness('Average Seriousness by Category', createAvgSeriousnessMap('incidentCategory')),
  ];

  return summaryParts.filter(p => p).join('\n\n');
};


export const getChatResponseForInsights = async (incidents: ProcessedIncident[], history: {role: 'user' | 'assistant', content: string}[]): Promise<string> => {
  const apiKey = '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';
  
  try {
    const groq = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Required for client-side usage
    });

const systemInstruction = `You are an expert data-analysis assistant. Answer questions using ONLY the provided data summary.

Return **one valid JSON object** with this structure:

{
  "responseType": "text" | "kpi" | "table" | "chart",
  "title": "Short title",
  "summary": "1–2 sentence insight.",
  "data": { ... }   // exactly ONE of the types below
}

DATA TYPES:
- chart -> { "chart": { "labels": [...], "values": [...], "chartType": "pie" | "bar" | "line" } }
  • pie = distribution/parts of whole
  • bar = category comparisons
  • line = time trends only ("Incidents per Month")

- table -> { "table": { "headers": [...], "rows": [...] } }

- kpi -> { "kpi": { "label": "...", "value": "..." } }

- text -> For unsupported questions or missing data.

RULES:
1. Use only the information in the data summary. Ensure all months are included chronologically for line charts.
2. Choose the correct responseType based on the user question.
3. Output ONLY the JSON. No explanations.`;

    const dataSummary = summarizeDataForPrompt(incidents);
    
    // Find the last user message to inject the data summary
    let lastUserMessageIndex = -1;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'user') {
        lastUserMessageIndex = i;
        break;
      }
    }

    if (lastUserMessageIndex === -1) {
      return JSON.stringify({
          responseType: 'text',
          title: 'Error',
          summary: 'No user question found in the conversation history.',
          data: { text: 'An internal error occurred.' }
      });
    }
    
    // Create a copy to avoid mutating state
    const historyCopy = JSON.parse(JSON.stringify(history));
    const originalUserQuestion = historyCopy[lastUserMessageIndex].content;

    // Prepend the data summary to the latest user question
    const fullUserPrompt = `
DATA SUMMARY:
---
${dataSummary}
---

QUESTION:
"${originalUserQuestion}"
  `;
  
    historyCopy[lastUserMessageIndex].content = fullUserPrompt;

    // Format for Groq API
    const messages: Groq.Chat.Completions.CompletionCreateParams.Message[] = historyCopy.map((msg: {role: 'user' | 'assistant'; content: string}) => ({
        role: msg.role,
        content: msg.content,
    }));
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        ...messages
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 4096, // Increased to provide more room for JSON response
      response_format: { type: "json_object" },
    });
    
    const responseText = chatCompletion.choices[0]?.message?.content;
    if (!responseText) {
        throw new Error("Empty response from Groq API");
    }
    return responseText;

  } catch (error) {
    console.error('Error fetching chat response from Groq:', error);
    return JSON.stringify({
        responseType: 'text',
        title: 'API Error',
        summary: "I'm sorry, I encountered an error. Please try again.",
        data: { text: `There was a problem communicating with the Groq AI service. Details: ${error instanceof Error ? error.message : String(error)}` }
    });
  }
};