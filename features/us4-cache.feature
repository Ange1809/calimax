@manual
Feature: Caché de metadata
  Scenario: Una consulta repetida usa la caché
    Given metadata previamente consultada hace menos de doce horas
    When solicita nuevamente el mismo recurso
    Then recibe la respuesta cacheada sin consultar TMDB

  Scenario: La caché expira
    Given metadata con TTL vencido
    When solicita nuevamente el recurso
    Then el sistema consulta TMDB y actualiza la caché
