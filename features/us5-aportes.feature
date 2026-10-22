@manual
Feature: Envío de aportes
  Scenario: Un usuario autenticado crea un aporte
    Given un usuario autenticado con enlaces válidos
    When envía un aporte
    Then recibe código 201 y estado PENDIENTE

  Scenario: Un usuario anónimo intenta crear un aporte
    Given una solicitud sin JWT
    When envía un aporte
    Then recibe código 401
