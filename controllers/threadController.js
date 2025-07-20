const Thread = require("../models/Thread");

// POST /api/threads/:board
exports.createThread = async (req, res) => {
  const { board } = req.params;
  const { text, delete_password } = req.body;
  try {
    const thread = new Thread({ board, text, delete_password });
    await thread.save();
    res.redirect(`/b/${board}/`);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// GET /api/threads/:board
exports.getThreads = async (req, res) => {
  try {
    const threads = await Thread.find({ board: req.params.board })
      .sort({ bumped_on: -1 })
      .limit(10)
      .select("-delete_password -reported")
      .lean();

    threads.forEach((t) => {
      t.replies = (t.replies || [])
        .sort((a, b) => new Date(b.created_on) - new Date(a.created_on))
        .slice(0, 3)
        .map(({ _id, text, created_on }) => ({ _id, text, created_on }));
    });

    res.json(threads);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// DELETE /api/threads/:board
exports.deleteThread = async (req, res) => {
  const { thread_id, delete_password } = req.body;
  try {
    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send("thread not found");
    if (thread.delete_password !== delete_password)
      return res.send("incorrect password");

    await Thread.findByIdAndDelete(thread_id);
    res.send("success");
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// PUT /api/threads/:board
exports.reportThread = async (req, res) => {
  const { thread_id } = req.body;
  try {
    await Thread.findByIdAndUpdate(thread_id, { reported: true });
    res.send('success');
  } catch (err) {
    res.status(500).send("Server error");
  }
};
