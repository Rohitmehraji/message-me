import * as DocumentPicker from "expo-document-picker";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Card } from "@/components/Card";
import { Toast } from "@/components/Toast";
import { api } from "@/api/client";
import { useToast } from "@/hooks/useToast";
import { colors } from "@/theme/colors";
import { countWords } from "@/utils/message";

type Device = { id: number; name: string; code: string; phoneNumber: string };

export default function Home() {
  const toast = useToast();
  const [devices, setDevices] = useState<Device[]>([]);
  const [stats, setStats] = useState({ totalSms: 0, sent: 0, failed: 0, pending: 0, scheduled: 0 });
  const [message, setMessage] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | undefined>();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const words = useMemo(() => countWords(message), [message]);

  const load = async () => {
    const [statsResponse, devicesResponse] = await Promise.all([
      api<{ data: typeof stats }>("/dashboard/stats"),
      api<{ data: Device[] }>("/devices")
    ]);
    setStats(statsResponse.data);
    setDevices(devicesResponse.data);
  };

  useEffect(() => {
    load().catch((err) => toast.showError(err.message));
  }, []);

  const addContact = async () => {
    try {
      await api("/contacts", {
        method: "POST",
        body: JSON.stringify({ name: contactName, phoneNumber, deviceId: selectedDeviceId })
      });
      setContactName("");
      setPhoneNumber("");
      toast.showSuccess("Contact added");
    } catch (error) {
      toast.showError(error instanceof Error ? error.message : "Unable to add contact");
    }
  };

  const pickFile = async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
    });
    if (!picked.canceled) setFile(picked.assets[0]);
  };

  const uploadFile = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", { uri: file.uri, type: file.mimeType, name: file.name } as never);
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api"}/contacts/bulk-upload`, {
      method: "POST",
      body: form
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message);
    toast.showSuccess(`Uploaded: ${json.inserted}, skipped: ${json.skipped}`);
  };

  const submitCampaign = async (mode: "send-now" | "schedule") => {
    if (words > 20) return toast.showError("Message max 20 words");
    const payload = {
      message,
      scheduledTime: scheduledTime || undefined,
      deviceId: selectedDeviceId,
      durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
      timeSlot: slotStart && slotEnd ? { start: slotStart, end: slotEnd } : undefined
    };
    await api(`/campaigns/${mode}`, { method: "POST", body: JSON.stringify(payload) });
    toast.showSuccess(mode === "send-now" ? "Sent" : "Scheduled");
  };

  return (
    <View style={styles.page}>
      {toast.message ? <Toast message={toast.message} type={toast.kind} /> : null}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Message-Me</Text>
        <Text style={styles.subheading}>Premium SMS scheduling and delivery control.</Text>

        <View style={styles.statsRow}>
          {Object.entries(stats).map(([key, value]) => (
            <Card key={key}>
              <Text style={styles.statLabel}>{key}</Text>
              <Text style={styles.statValue}>{value}</Text>
            </Card>
          ))}
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Device quick select</Text>
          <View style={styles.quickRow}>
            {devices.length === 0 ? <Text style={styles.helper}>No devices yet. Register from API.</Text> : null}
            {devices.map((device) => (
              <Pressable key={device.id} style={styles.quickButton} onPress={() => setSelectedDeviceId(device.id)}>
                <Text style={styles.quickText}>{device.code}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Add Contact</Text>
          <TextInput placeholder="Name" placeholderTextColor={colors.subtext} value={contactName} onChangeText={setContactName} style={styles.input} />
          <TextInput placeholder="Phone (+15551234567)" placeholderTextColor={colors.subtext} value={phoneNumber} onChangeText={setPhoneNumber} style={styles.input} />
          <Pressable style={styles.button} onPress={addContact}><Text style={styles.buttonText}>Add Contact</Text></Pressable>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Bulk Upload Contacts</Text>
          <Text style={styles.helper}>Supports .csv, .xls, .xlsx</Text>
          <View style={styles.quickRow}>
            <Pressable style={styles.buttonSecondary} onPress={pickFile}><Text style={styles.buttonText}>Choose file</Text></Pressable>
            <Pressable style={styles.buttonSecondary} onPress={() => uploadFile().catch((e) => toast.showError(e.message))}><Text style={styles.buttonText}>Upload selected file</Text></Pressable>
            <Pressable style={styles.buttonSecondary} onPress={() => setFile(null)}><Text style={styles.buttonText}>Clear file</Text></Pressable>
          </View>
          <Text style={styles.helper}>{file?.name ?? "No file selected"}</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Compose & Schedule</Text>
          <TextInput multiline placeholder="Write your SMS" placeholderTextColor={colors.subtext} value={message} onChangeText={setMessage} style={[styles.input, styles.messageInput]} />
          <Text style={styles.helper}>{words}/20 words</Text>
          <TextInput placeholder="Scheduled time (ISO)" placeholderTextColor={colors.subtext} value={scheduledTime} onChangeText={setScheduledTime} style={styles.input} />
          <TextInput placeholder="Duration minutes" placeholderTextColor={colors.subtext} value={durationMinutes} onChangeText={setDurationMinutes} style={styles.input} />
          <View style={styles.quickRow}>
            <TextInput placeholder="Slot start HH:mm" placeholderTextColor={colors.subtext} value={slotStart} onChangeText={setSlotStart} style={[styles.input, styles.half]} />
            <TextInput placeholder="Slot end HH:mm" placeholderTextColor={colors.subtext} value={slotEnd} onChangeText={setSlotEnd} style={[styles.input, styles.half]} />
          </View>
          <View style={styles.quickRow}>
            <Pressable style={styles.button} onPress={() => submitCampaign("send-now").catch((e) => toast.showError(e.message))}><Text style={styles.buttonText}>Send now</Text></Pressable>
            <Pressable style={styles.button} onPress={() => submitCampaign("schedule").catch((e) => toast.showError(e.message))}><Text style={styles.buttonText}>Schedule</Text></Pressable>
            <Pressable style={styles.buttonSecondary} onPress={() => { setScheduledTime(""); setDurationMinutes(""); setSlotStart(""); setSlotEnd(""); }}><Text style={styles.buttonText}>Clear timing fields</Text></Pressable>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  container: { maxWidth: 1100, width: "100%", marginHorizontal: "auto", padding: 20, gap: 16 },
  heading: { color: colors.text, fontSize: 36, fontWeight: "800" },
  subheading: { color: colors.subtext, fontSize: 16, marginBottom: 8 },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statLabel: { color: colors.subtext, textTransform: "capitalize" },
  statValue: { color: colors.text, fontSize: 24, fontWeight: "800" },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "700" },
  helper: { color: colors.subtext },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#0e1430"
  },
  messageInput: { minHeight: 90, textAlignVertical: "top" },
  quickRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", alignItems: "center" },
  quickButton: { borderRadius: 999, backgroundColor: "#232e63", paddingHorizontal: 14, paddingVertical: 8 },
  quickText: { color: colors.text, fontWeight: "700" },
  button: { backgroundColor: colors.accent, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  buttonSecondary: { backgroundColor: "#29335e", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  buttonText: { color: colors.text, fontWeight: "700" },
  half: { flex: 1, minWidth: 180 }
});
