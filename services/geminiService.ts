
import { GoogleGenAI, Type } from "@google/genai";

// Always use a named parameter for apiKey and obtain it from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (
  transactions: any[], 
  investments: any[]
) => {
  try {
    const prompt = `
      Dựa trên dữ liệu tài chính sau:
      Giao dịch: ${JSON.stringify(transactions.slice(0, 5))}
      Đầu tư: ${JSON.stringify(investments)}
      Hãy đưa ra 3 lời khuyên ngắn gọn bằng tiếng Việt để tối ưu hóa chi tiêu và đầu tư chứng khoán VN.
      Trả về dưới dạng JSON array: ["lời khuyên 1", "lời khuyên 2", "lời khuyên 3"]
    `;

    // Using gemini-3-flash-preview as recommended for basic text tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    // Use response.text property directly, not response.text()
    return JSON.parse(response.text?.trim() || "[]");
  } catch (error) {
    console.error("AI Insight Error:", error);
    return ["Hãy đa dạng hóa danh mục đầu tư của bạn.", "Theo dõi sát sao VNINDEX trong tuần này.", "Tiết kiệm 20% thu nhập mỗi tháng."];
  }
};
