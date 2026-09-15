Feature: Autocompletado de Metadata con TMDB
  Como usuario colaborador
  Quiero ingresar el ID de una película o programa de TV
  Para que el sistema devuelva automáticamente su información oficial (título, sinopsis, póster, elenco, géneros y si es en vivo)

  Scenario: Autocompletado exitoso de una película existente
    Given que el servidor TMDB está funcionando correctamente
    When el usuario solicita la metadata de la "pelicula" con ID "27205"
    Then el sistema debe responder con código 200
    And el cuerpo de la respuesta debe contener el título "Inception"
    And el cuerpo de la respuesta debe contener al menos 1 género
    And el cuerpo de la respuesta debe contener al menos 1 actor en el elenco
    And el cuerpo de la respuesta debe indicar que "es_envivo" es falso

  Scenario: Autocompletado de un programa de TV o evento En Vivo
    Given que el servidor TMDB está funcionando correctamente
    When el usuario solicita la metadata de la "tv" con ID "1399"
    Then el sistema debe responder con código 200
    And el cuerpo de la respuesta debe contener el título "Game of Thrones"
    And el cuerpo de la respuesta debe indicar que "es_envivo" es verdadero

  Scenario: Multimedia no encontrada en TMDB
    Given que el servidor TMDB está funcionando correctamente
    When el usuario solicita la metadata de la "pelicula" con ID "999999999"
    Then el sistema debe responder con código 404
