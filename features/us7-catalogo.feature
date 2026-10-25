@manual
Feature: Catálogo paginado
  Scenario: Se consulta el catálogo público
    Given aportes publicados en el catálogo
    When solicita una página del catálogo
    Then recibe solo aportes PUBLICADO con paginación

  Scenario: Los aportes pendientes no son visibles
    Given aportes pendientes en la base de datos
    When solicita el catálogo
    Then la respuesta no incluye esos aportes
