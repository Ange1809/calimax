import { Given, When, Then } from '@cucumber/cucumber';
import * as assert from 'assert';
import request from 'supertest';
import app from '../../src/app.js';
import axios from 'axios';

let responseStatus: number = 0;
let responseBody: any = null;
const originalGet = axios.get;

Given('que el servidor TMDB está funcionando correctamente', function () {
  (axios as any).get = async (url: string) => {
    if (url.includes('movie/27205')) {
      return {
        data: {
          id: 27205,
          title: "Inception",
          overview: "Un ladrón que roba secretos...",
          poster_path: "/poster.jpg",
          release_date: "2010-07-15",
          genres: [{ id: 28, name: "Acción" }],
          credits: { cast: [{ name: "Leonardo DiCaprio" }, { name: "Joseph Gordon-Levitt" }] }
        }
      };
    } else if (url.includes('tv/1399')) {
      return {
        data: {
          id: 1399,
          name: "Game of Thrones",
          overview: "Siete familias nobles luchan por el control...",
          poster_path: "/got_poster.jpg",
          first_air_date: "2011-04-17",
          genres: [{ id: 10765, name: "Sci-Fi & Fantasy" }],
          credits: { cast: [{ name: "Emilia Clarke" }, { name: "Kit Harington" }] }
        }
      };
    } else {
      throw { response: { status: 404 } };
    }
  };
});

When('el usuario solicita la metadata de la {string} con ID {string}', async function (tipo: string, id: string) {
  const response = await request(app).get(`/api/metadata/tmdb/${tipo}/${id}`);
  responseStatus = response.status;
  responseBody = response.body;
});

Then('el sistema debe responder con código {int}', function (statusCode: number) {
  assert.strictEqual(responseStatus, statusCode, `Se esperaba ${statusCode} pero se recibió ${responseStatus}`);
});

Then('el cuerpo de la respuesta debe contener el título {string}', function (tituloEsperado: string) {
  assert.strictEqual(responseBody.titulo, tituloEsperado);
});

Then('el cuerpo de la respuesta debe contener al menos {int} género', function (cantidad: number) {
  assert.ok(Array.isArray(responseBody.generos), 'generos debe ser un arreglo');
  assert.ok(responseBody.generos.length >= cantidad, 'No hay suficientes géneros');
});

Then('el cuerpo de la respuesta debe contener al menos {int} actor en el elenco', function (cantidad: number) {
  assert.ok(Array.isArray(responseBody.elenco), 'elenco debe ser un arreglo');
  assert.ok(responseBody.elenco.length >= cantidad, 'No hay suficientes actores');
});

Then('el cuerpo de la respuesta debe indicar que {string} es falso', function (campo: string) {
  assert.strictEqual(responseBody[campo], false);
});

Then('el cuerpo de la respuesta debe indicar que {string} es verdadero', function (campo: string) {
  assert.strictEqual(responseBody[campo], true);
  (axios as any).get = originalGet;
});
