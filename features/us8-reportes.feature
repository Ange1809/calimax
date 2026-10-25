@manual
Feature: Reportes de enlaces
  Scenario: Se registra un reporte
    Given un enlace publicado
    When un usuario lo reporta
    Then su contador de reportes aumenta en uno

  Scenario: El quinto reporte marca el enlace para revisión
    Given un enlace con cuatro reportes
    When recibe otro reporte
    Then pasa automáticamente a estado REVISION
