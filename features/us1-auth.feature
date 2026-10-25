@manual
Feature: Autenticación de usuarios
  Scenario: Registro y login exitosos
    Given un usuario nuevo con email válido
    When registra su cuenta y luego inicia sesión
    Then recibe un JWT con userId y rol

  Scenario: Login con credenciales inválidas
    Given un usuario registrado
    When intenta iniciar sesión con una contraseña incorrecta
    Then recibe código 401
