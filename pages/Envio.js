import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
  Button,
} from "react-native";
import axios from "axios";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

// Configura como as notificações aparecerão
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Home() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [userSelected, setUserSelected] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();

  const API = "https://api-mobile-qekb.onrender.com/usuarios";

  useEffect(() => {
    carregarUsuarios();
    registerForPushNotificationsAsync().then((token) => {
      console.log("TOKEN EXPO ==> ", token);
      setExpoPushToken(token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notificação recebida:", notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Usuário clicou na notificação:", response);
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function carregarUsuarios() {
    try {
      const response = await axios.get(API);
      setUsuarios(response.data);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar usuários");
    }
  }

  async function enviarNotificacao() {
    if (!userSelected?.tokenexpo) {
      Alert.alert(
        "Token ausente",
        "Este usuário não possui Token Expo cadastrado."
      );
      return;
    }

    if (!mensagem.trim()) {
      Alert.alert("Digite uma mensagem");
      return;
    }

    try {
      const payload = {
        to: userSelected.tokenexpo,
        sound: "default",
        title: "Nova Notificação",
        body: mensagem,
      };

      console.log("Payload:", payload);

      const response = await axios.post(
        "https://exp.host/--/api/v2/push/send",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Resposta Expo:", response.data);

      Alert.alert("Enviado!", "Notificação enviada para " + userSelected.nome);
      setMensagem("");
      setModalVisible(false);
    } catch (error) {
      console.log("Erro ao enviar notificação:", error.response || error);
      Alert.alert(
        "Erro ao enviar",
        "Verifique o token ou sua conexão com a internet."
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Usuários Cadastrados</Text>

      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => {
              setUserSelected(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.userNome}>{item.nome}</Text>
            <Text>{item.email}</Text>
            <Text style={{ color: item.tokenexpo ? "green" : "red" }}>
              {item.tokenexpo ? "Token OK" : "Sem Token"}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalFundo}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>
              Enviar para {userSelected?.nome}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite a mensagem"
              value={mensagem}
              onChangeText={setMensagem}
              multiline
            />

            <TouchableOpacity style={styles.botao} onPress={enviarNotificacao}>
              <Text style={styles.botaoTexto}>Enviar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botao, { backgroundColor: "gray" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.botaoTexto}>Cancelar</Text>
            </TouchableOpacity>

            <Text style={{ marginTop: 10, fontSize: 12 }}>
              Seu token do Expo: {expoPushToken || "Gerando..."}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Função para registrar e pegar token Expo
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Permissão negada!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("TOKEN EXPO OBTIDO: ", token);
  } else {
    alert("Você precisa testar em um dispositivo físico!");
  }
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
  return token;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  userItem: {
    padding: 15,
    backgroundColor: "#eee",
    marginBottom: 10,
    borderRadius: 10,
  },
  userNome: { fontWeight: "bold", fontSize: 18 },
  modalFundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
  },
  modalTitulo: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 10,
    padding: 10,
    height: 90,
    textAlignVertical: "top",
    marginBottom: 15,
  },
  botao: {
    backgroundColor: "#0066ff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  botaoTexto: { color: "#fff", textAlign: "center", fontSize: 16 },
});
