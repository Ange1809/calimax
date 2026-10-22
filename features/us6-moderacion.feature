@manual
Feature: Panel de moderación
  Scenario: Un moderador consulta aportes pendientes
    Given un usuario con rol MODERATOR
    When consulta el panel de pendientes
    Then recibe código 200 con los aportes PENDIENTE

  Scenario: Un usuario sin rol de moderador cambia un estado
    Given un usuario con rol USER
    When intenta publicar un aporte
    Then recibe código 403
