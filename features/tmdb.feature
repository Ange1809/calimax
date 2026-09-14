Feature: Autocompletado de Metadata con TMDB
  Como usuario colaborador
  Quiero ingresar el ID de una película
  Para que el sistema devuelva automáticamente su información oficial (título, sinopsis, póster) y no escribirla a mano

  Scenario: Autocompletado exitoso de una película existente
    Given que el servidor TMDB está funcionando correctamente
    When el usuario solicita la metadata del ID "27205"
    Then el sistema debe responder con código 200
    And el cuerpo de la respuesta debe contener el título "Inception"
    And el cuerpo de la respuesta debe contener una "url_poster" válida

  Scenario: Película no encontrada en TMDB
    Given que el servidor TMDB está funcionando correctamente
    When el usuario solicita la metadata de un ID inexistente "999999999"
    Then el sistema debe responder con código 404
    And el cuerpo de la respuesta debe indicar "Película no encontrada"
