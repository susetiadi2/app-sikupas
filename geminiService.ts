
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getEmpatheticAdvice = async (findings: string[], actions: string[]) => {
  try {
    const prompt = `
      Saya adalah seorang pengawas sekolah yang baru saja melakukan kunjungan.
      Temuan saya: ${findings.join(', ')}.
      Rencana aksi: ${actions.join(', ')}.
      
      Berikan 3 poin saran singkat dalam bahasa Indonesia yang sangat empatik dan menyemangati bagi kepala sekolah.
      Gunakan gaya bahasa seorang mentor yang bijak, bukan atasan yang menghakimi.
      Fokus pada pengembangan mindset dan pertumbuhan manusia.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah asisten cerdas bagi pengawas sekolah senior yang mengutamakan kecerdasan emosi dan kepemimpinan transformatif.",
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Teruslah mendampingi dengan hati. Setiap langkah kecil menuju perubahan adalah kemenangan.";
  }
};

export const getLeadershipAdvice = async (name: string, region: string) => {
  try {
    const prompt = `Berikan satu kutipan kepemimpinan transformatif yang mendalam dalam Bahasa Indonesia untuk Bapak/Ibu ${name}, seorang Pengawas Sekolah di wilayah ${region}. Fokus pada semangat pengabdian dan ketulusan mendampingi guru. Maksimal 30 kata.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah mentor bagi para pemimpin pendidikan Indonesia.",
      }
    });
    return response.text;
  } catch (error) {
    return "Kepemimpinan adalah seni memberdayakan orang lain untuk melampaui batas mereka sendiri.";
  }
};
