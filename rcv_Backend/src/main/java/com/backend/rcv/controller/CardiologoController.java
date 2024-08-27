package com.backend.rcv.controller;

import com.backend.rcv.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController("/administracion")
public class CardiologoController {

    private UsuarioService usuarioService;


    @PutMapping("/users/{userId}/roles")
    public ResponseEntity<?> addRoleToUser(@PathVariable Long userId, @RequestBody String roleName) {
        usuarioService.addRoleToUser(userId, roleName);
        return ResponseEntity.ok("Rol asignado exitosamente");
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        return usuarioService.findById(id)
                .map(user -> {
                    usuarioService.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
        }
    }
