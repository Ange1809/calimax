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
    if (url.includes('27205')) {
      return {
        data: {
          id: 27205,
          title: "Inception",
          overview: "Un ladrón que roba secretos corporativos...",
          poster_path: "/inception_poster.jpg",
          release_date: "2010-07-15"
        }
      };
    } else {
      throw { response: { status: 404 } };
    }
  };
});

When('el usuario solicita la metadata del ID {string}', async function (id: string) {
  const response = await request(app).get('/api/metadata/tmdb/' + id);
  responseStatus = response.status;
  responseBody = response.body;
});

When('el usuario solicita la metadata de un ID inexistente {string}', async function (id: string) {
  const response = await request(app).get('/api/metadata/tmdb/' + id);
  responseStatus = response.status;
  responseBody = response.body;
});

Then('el sistema debe responder con código {int}', function (statusCode: number) {
  assert.strictEqual(responseStatus, statusCode, `Se esperaba ${statusCode} pero se recibió ${responseStatus}`);
});

Then('el cuerpo de la respuesta debe contener el título {string}', function (tituloEsperado: string) {
  assert.strictEqual(responseBody.titulo, tituloEsperado);
});

Then('el cuerpo de la respuesta debe contener una {string} válida', function (campo: string) {
  assert.ok(responseBody[campo], `Falta el campo ${campo} en la respuesta`);
});

Then('el cuerpo de la respuesta debe indicar {string}', function (mensajeError: string) {
  assert.strictEqual(responseBody.error, mensajeError);
  (axios as any).get = originalGet;
});
