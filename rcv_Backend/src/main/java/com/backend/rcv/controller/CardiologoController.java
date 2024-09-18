package com.backend.rcv.controller;

import com.backend.rcv.model.Rol;
import com.backend.rcv.model.Usuario;
import com.backend.rcv.service.RolService;
import com.backend.rcv.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/administracion")
public class CardiologoController {

    private final UsuarioService usuarioService;
    private final RolService rolService;

    @Autowired
    public CardiologoController(UsuarioService usuarioService, RolService rolService) {
        this.usuarioService = usuarioService;
        this.rolService = rolService;
    }

    // CRUD for Roles

    @PostMapping("/roles")
    public ResponseEntity<Rol> createRole(@RequestBody Rol rol) {
        Rol createdRole = rolService.createRole(rol);
        return ResponseEntity.ok(createdRole);
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Rol>> getAllRoles() {
        List<Rol> roles = rolService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<Rol> getRoleById(@PathVariable Long id) {
        Optional<Rol> role = rolService.getRoleById(id);
        return role.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<Rol> updateRole(@PathVariable Long id, @RequestBody Rol rol) {
        Optional<Rol> updatedRole = rolService.updateRole(id, rol);
        return updatedRole.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        boolean deleted = rolService.deleteRole(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // User Role Management

    @PutMapping("/users/{userId}/roles")
    public ResponseEntity<String> addRoleToUser(@PathVariable Long userId, @RequestBody String roleName) {
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
