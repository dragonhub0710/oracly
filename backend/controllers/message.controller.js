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
    const { messages } = req.body;
    const file = req.file;

    const filePath = path.join(__dirname, "..", "uploads", file.filename);

    let transcription = "";
    transcription = await getTranscription(filePath);

    let list = JSON.parse(messages);
    if (transcription && transcription != "") {
      list.push({ role: "user", content: transcription });
    }
    let data = await getSummary(list);

    res.status(200).json({ data });
    await unlinkAsync(filePath);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getSummary = async (list) => {
  try {
    let msgs = [...list];
    let array = [...list];

    msgs.unshift({ role: "system", content: process.env.SYSTEM_PROMPT });

    const completion = await openai.chat.completions.create({
      messages: msgs,
      model: "gpt-4o",
    });
    array.push({
      role: "assistant",
      content: completion.choices[0].message.content,
    });
    return JSON.stringify(array);
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
