import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Notifications from "expo-notifications";
import axios from "axios";

export default function Cadastro({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tokenExpo, setTokenExpo] = useState(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [saving, setSaving] = useState(false);

  const API = "https://api-mobile-qekb.onrender.com/usuarios";

  // Capturar token do Expo (robusto e com logs)
  useEffect(() => {
    let mounted = true;

    async function getToken() {
      try {
        setLoadingToken(true);
        const { status } = await Notifications.requestPermissionsAsync();

        if (status !== "granted") {
          Alert.alert("Permissão negada", "Ative as notificações.");
          setLoadingToken(false);
          return;
        }

        const tokenObj = await Notifications.getExpoPushTokenAsync();
        // tokenObj pode ser: { data: 'ExponentPushToken[...]' } ou diretamente 'ExponentPushToken[...]'
        const token =
          (tokenObj && (tokenObj.data ?? tokenObj.token ?? tokenObj)) || null;

        if (mounted) {
          setTokenExpo(token);
          setLoadingToken(false);
          console.log("TOKEN EXPO GERADO:", token);
        }
      } catch (err) {
        console.log("Erro ao obter token:", err);
        setLoadingToken(false);
      }
    }

    getToken();

    return () => {
      mounted = false;
    };
  }, []);

  async function salvar() {
    if (!nome || !email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    // Validação de e-mail
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValido.test(email)) {
      Alert.alert("Erro", "Digite um e-mail válido.");
      return;
    }

    // Garantir que token foi obtido (ou pelo menos tentar)
    if (loadingToken) {
      Alert.alert("Aguarde", "Ainda estamos obtendo o token de notificações.");
      return;
    }

    // Mostre no console o token antes de enviar (debug)
    console.log("Antes de enviar - tokenExpo state:", tokenExpo);

    try {
      setSaving(true);
      console.log("⏳ Enviando para API do Render...");

      // Envia ambos campos para evitar problemas de case-sensitive no backend
      const payload = {
        nome,
        email,
        senha,
        tokenExpo: tokenExpo ?? "", // minúsculo (se seu backend espera esse)
        // tokenExpo: tokenExpo ?? "", // camelCase (por segurança)
      };

      console.log("Payload:", payload);

      const resp = await axios.post(API, payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✔️ Resposta do servidor:", resp.data);
      Alert.alert("Sucesso", "Usuário cadastrado!");
      navigation.navigate("Login");
    } catch (error) {
      console.log("❌ Erro no POST:", error.response?.data || error.message || error);
      Alert.alert("Erro", "Não foi possível salvar no servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro</Text>

      <TextInput
        placeholder="Nome"
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        autoCapitalize="words"
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
      />

      <Text style={styles.token}>Token Expo:</Text>
      {loadingToken ? (
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <ActivityIndicator size="small" />
          <Text style={[styles.tokenTexto, { marginLeft: 8 }]}>Gerando token...</Text>
        </View>
      ) : (
        <Text style={styles.tokenTexto}>{tokenExpo || "Token não disponível"}</Text>
      )}

      <TouchableOpacity
        style={[styles.botao, (loadingToken || saving) && { opacity: 0.6 }]}
        onPress={salvar}
        disabled={loadingToken || saving}
      >
        <Text style={styles.botaoTexto}>{saving ? "Salvando..." : "Cadastrar"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  titulo: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 10,
    marginBottom: 12,
  },
  botao: {
    backgroundColor: "#0066ff",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  botaoTexto: { color: "#fff", textAlign: "center", fontSize: 18 },
  token: { marginTop: 10, fontWeight: "bold" },
  tokenTexto: { fontSize: 12, color: "#333" },
});
