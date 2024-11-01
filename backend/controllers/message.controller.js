const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const { createClient } = require("@deepgram/sdk");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

exports.summarize = async (req, res) => {
  try {
    const { original_text } = req.body;
    const file = req.file;

    const filePath = path.join(__dirname, "..", "uploads", file.filename);

    let transcription = "";
    transcription = await getTranscription(filePath);

    let data = await getSummary(transcription, original_text);

    res.status(200).json({ data });
    await unlinkAsync(filePath);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getSummary = async (transcription, original_text) => {
  try {
    let msgs = [
      {
        role: "system",
        content: process.env.SYSTEM_PROMPT,
      },
    ];

    if (original_text && original_text != "") {
      msgs.push({ role: "assistant", content: original_text });
    }

    if (transcription && transcription != "") {
      msgs.push({ role: "user", content: transcription });
    }

    const completion = await openai.chat.completions.create({
      messages: msgs,
      model: "gpt-4o",
    });
    return completion.choices[0].message.content;
  } catch (err) {
    console.log(err);
  }
};

const getTranscription = async (filePath) => {
  try {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    let transcription = "";

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      fs.readFileSync(filePath),
      {
        model: "nova-2",
        smart_format: true,
      }
    );
    if (error) {
      console.log("error----", error);
    }
    if (result) {
      transcription =
        result.results.channels[0].alternatives[0].transcript + " ";
    }

    return transcription;
  } catch (err) {
    console.log(err);
  }
};
