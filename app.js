import app from './dist/src/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor Calimax corriendo en http://localhost:${PORT}`);
});