package com.backend.rcv.service;


import com.backend.rcv.model.Rol;
import com.backend.rcv.model.Usuario;
import com.backend.rcv.repository.RolRepository;
import com.backend.rcv.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private RolRepository rolRepository;

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }

    public Usuario save(Usuario user) {
        return usuarioRepository.save(user);
    }

    public void deleteById(Long id) {
        usuarioRepository.deleteById(id);
    }

    public void addRoleToUser(Long userId, String roleName) {
        Optional<Usuario> userOpt = usuarioRepository.findById(userId);
        if (userOpt.isPresent()) {
            Usuario usuario = userOpt.get();
            Rol role = rolRepository.findByNombre(roleName);
            if (role == null) {
                throw new RuntimeException("Rol no encontrado: " + roleName);
            }

            usuario.setRol(role);
            usuarioRepository.save(usuario);
        } else {
            throw new RuntimeException("Usuario no encontrado");
        }
    }
}
