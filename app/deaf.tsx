import { View, Pressable, Text, TextInput, ScrollView, Alert } from 'react-native';
import { styles } from './styles';
import { useState, useEffect, useRef } from 'react';
import WhisperLiveClient from './whisperLiveClient';

export default function Deaf() {
  const [prompt, setPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'single' | 'split'>('single');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');

  const clientRef = useRef<WhisperLiveClient | null>(null);

  useEffect(() => {
    clientRef.current = new WhisperLiveClient({
      host: '192.168.1.100', // Change to your server IP
      port: 9090,
      onTranscription: (text, segments) => {
        setTranscript(text);
        console.log('[Deaf] Transcript:', text);
      },
      onConnectionStatus: (status) => {
        setConnectionStatus(status);
        console.log('[Deaf] Connection status:', status);
      }
    });

    return () => {
      clientRef.current?.disconnect();
    };
  }, []);

  const handleRecord = async () => {
    if (!isRecording) {
      try {
        await clientRef.current?.connect();
        console.log('[Deaf] ✓ Connected successfully');

        await clientRef.current?.startRecording();
        console.log('[Deaf] ✓ Recording started');

        setRecordingMode(prompt.length > 0 ? 'split' : 'single');
        setIsRecording(true);
      } catch (error) {
        console.error('[Deaf] ✗ Connection failed:', error);
        Alert.alert('Error', 'Failed to connect to server');
      }
    } else {
      await clientRef.current?.stopRecording();
      console.log('[Deaf] Recording stopped');
      setIsRecording(false);
    }
  };

  const showSplit = recordingMode === 'split';

  return (
    <View style={styles.container}>
      <View style={{ flex: 0.25, padding: 10, justifyContent: 'center' }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: isRecording ? '#e0e0e0' : 'white',
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            fontSize: 18,
            textAlignVertical: 'top'
          }}
          placeholder="Enter prompt (e.g., 'Summarize focusing on todos')"
          value={prompt}
          onChangeText={setPrompt}
          editable={!isRecording}
          multiline
        />
      </View>

      {showSplit ? (
        <View style={{ flex: 0.5 }}>
          <ScrollView style={{ flex: 0.75, backgroundColor: '#f5f5f5', padding: 10 }}>
            <Text style={{ fontSize: 16 }}>{summary || 'Summary will appear here...'}</Text>
          </ScrollView>
          <ScrollView style={{ flex: 0.25, backgroundColor: 'white', padding: 10, borderTopWidth: 1, borderTopColor: '#ccc' }}>
            <Text style={{ fontSize: 14, color: '#666' }}>{transcript || 'Transcript...'}</Text>
          </ScrollView>
        </View>
      ) : (
        <ScrollView style={{ flex: 0.5, backgroundColor: 'white', padding: 10 }}>
          <Text style={{ fontSize: 16 }}>{transcript || 'Transcript will appear here...'}</Text>
        </ScrollView>
      )}

      <Pressable
        style={{ flex: 0.25, backgroundColor: isRecording ? '#F44336' : '#4CAF50', justifyContent: 'center', alignItems: 'center' }}
        onPress={handleRecord}
      >
        <Text style={styles.buttonText}>{isRecording ? 'STOP' : 'RECORD'}</Text>
      </Pressable>
    </View>
  );
}
