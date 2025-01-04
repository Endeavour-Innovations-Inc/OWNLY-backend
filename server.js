app.post('/api/proposals', async (req, res) => {
  const { name, description } = req.body; // Assuming you want to store a description too
  try {
      const { rows } = await pool.query(
          'INSERT INTO proposals (name, description) VALUES ($1, $2) RETURNING *;',
          [name, description]
      );
      res.status(201).json(rows[0]);
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});
