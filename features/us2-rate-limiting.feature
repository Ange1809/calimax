@manual
Feature: Límite de intentos de autenticación
  Scenario: Las primeras solicitudes de autenticación son aceptadas
    Given una IP sin solicitudes recientes
    When realiza hasta cinco intentos de autenticación
    Then las solicitudes reciben una respuesta de autenticación

  Scenario: Se bloquea el exceso de intentos
    Given una IP que ya realizó cinco intentos en quince minutos
    When realiza otro intento de autenticación
    Then recibe código 429
