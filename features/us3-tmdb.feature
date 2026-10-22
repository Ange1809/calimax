@manual
Feature: Metadata de TMDB
  Scenario: Se obtiene metadata de una película existente
    Given un ID válido de TMDB
    When solicita la metadata
    Then recibe el DTO limpio de la película

  Scenario: La película no existe
    Given un ID inexistente de TMDB
    When solicita la metadata
    Then recibe código 404
