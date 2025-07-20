const Thread = require("../models/Thread");

// POST /api/replies/:board
exports.createReply = async (req, res) => {
  const { thread_id, text, delete_password } = req.body;
  try {
    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send("thread not found");

    thread.replies.push({ text, delete_password });
    thread.bumped_on = new Date();
    await thread.save();

    res.redirect(`/b/${req.params.board}/${thread_id}`);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// GET /api/replies/:board?thread_id=...
exports.getThreadWithReplies = async (req, res) => {
  try {
    const thread = await Thread.findById(req.query.thread_id)
      .select("-delete_password -reported")
      .lean();

    if (!thread) return res.send("thread not found");

    thread.replies = (thread.replies || []).map((r) => ({
      _id: r._id,
      text: r.text,
      created_on: r.created_on,
    }));

    res.json(thread);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// DELETE /api/replies/:board
exports.deleteReply = async (req, res) => {
  const { thread_id, reply_id, delete_password } = req.body;
  try {
    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send("thread not found");

    const reply = thread.replies.id(reply_id);
    if (!reply) return res.send("reply not found");

    if (reply.delete_password !== delete_password) {
      return res.send("incorrect password");
    }

    reply.text = "[deleted]";
    await thread.save();
    res.send("success");
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// PUT /api/replies/:board
exports.reportReply = async (req, res) => {
  const { thread_id, reply_id } = req.body;
  try {
    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send("thread not found");

    const reply = thread.replies.id(reply_id);
    if (!reply) return res.send("reply not found");

    reply.reported = true;
    await thread.save();

    res.send('success');
  } catch (err) {
    res.status(500).send("Server error");
  }
};
