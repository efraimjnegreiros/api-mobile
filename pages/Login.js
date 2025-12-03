import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const API = "https://api-mobile-qekb.onrender.com/usuarios";

  async function entrar() {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha email e senha!");
      return;
    }

    try {
      // 🔥 Busca TODOS os usuários
      const response = await axios.get(API);

      console.log("Usuários recebidos:", response.data);

      // 🔎 Filtra pelo email e senha informados
      const usuario = response.data.find(
        (u) => u.email === email && u.senha === senha
      );

      if (!usuario) {
        Alert.alert("Erro", "Usuário ou senha inválidos!");
        return;
      }

      Alert.alert("Sucesso", `Bem-vindo, ${usuario.nome}!`);
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });


      // Navegar após login
      // navigation.navigate("Home");

    } catch (err) {
      console.log("Erro ao logar:", err);
      Alert.alert("Erro ao conectar", err.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Login</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.botao} onPress={entrar}>
        <Text style={styles.botaoTexto}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate("Cadastro")}
      >
        <Text style={styles.linkTexto}>Criar nova conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 10,
    marginBottom: 15,
  },
  botao: {
    backgroundColor: "#0066ff",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  botaoTexto: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
  },
  link: {
    marginTop: 20,
  },
  linkTexto: {
    textAlign: "center",
    color: "#0066ff",
    fontSize: 16,
  },
});
