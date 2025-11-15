import { View, Pressable, Text, TextInput, ScrollView, Alert } from 'react-native';
import { styles } from './styles';
import { useState } from 'react';
import { WhisperClient } from './whisperClient';
import Waveform from './Waveform';

export default function Deaf() {
  const [prompt, setPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'single' | 'split'>('single');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');

  const [client] = useState(() => new WhisperClient(
    'whisper-openshift-terminal.apps.cluster-xj5jp.xj5jp.sandbox664.opentlc.com',
    8080,
    (text) => setTranscript(text)
  ));

  const handleRecord = async () => {
    if (isProcessing) return;

    if (!isRecording) {
      try {
        setIsProcessing(true);
        setRecordingMode(prompt.length > 0 ? 'split' : 'single');
        setTranscript('');
        await client.startRecording();
        setIsRecording(true);
        setIsProcessing(false);
      } catch (error) {
        console.error('[Deaf] âœ— Recording failed:', error);
        Alert.alert('Recording Failed', String(error));
        setIsProcessing(false);
      }
    } else {
      try {
        setIsProcessing(true);
        await client.stopRecording();
        setIsRecording(false);
        setIsProcessing(false);
      } catch (error) {
        console.error('[Deaf] âœ— Transcription failed:', error);
        Alert.alert('Transcription Failed', String(error));
        setIsRecording(false);
        setIsProcessing(false);
      }
    }
  };

  const showSplit = recordingMode === 'split';
  const buttonColor = isProcessing ? styles.buttonGray : (isRecording ? styles.buttonRed : styles.buttonGreen);

  return (
    <View style={styles.container}>
      <View style={{ flex: 0.25, padding: 10 }}>
        <TextInput
          style={[styles.inputCard, {
            flex: 1,
            backgroundColor: (isRecording || isProcessing) ? '#f5f5f5' : '#fff',
            padding: 10,
            fontSize: 18,
            textAlignVertical: 'top'
          }]}
          placeholder="Enter prompt (e.g., 'Summarize focusing on todos')"
          value={prompt}
          onChangeText={setPrompt}
          editable={!isRecording && !isProcessing}
          multiline
        />
      </View>

      {showSplit ? (
        <View style={{ flex: 0.5, padding: 10, paddingTop: 0 }}>
          <View style={[styles.displayCard, { flex: 1 }]}>
            <ScrollView style={{ flex: 0.75, padding: 10 }}>
              <Text style={{ fontSize: 16 }}>{summary}</Text>
            </ScrollView>
            <View style={{ height: 1, backgroundColor: '#e0e0e0', marginHorizontal: 10 }} />
            <ScrollView style={{ flex: 0.25, padding: 10 }}>
              <Text style={{ fontSize: 14, color: '#666' }}>{transcript}</Text>
            </ScrollView>
          </View>
        </View>
      ) : (
        <View style={{ flex: 0.5, padding: 10, paddingTop: 0 }}>
          <ScrollView style={[styles.displayCard, { flex: 1, padding: 10 }]}>
            <Text style={{ fontSize: 16 }}>{transcript}</Text>
          </ScrollView>
        </View>
      )}

      <View style={{ flex: 0.25, padding: 10, paddingTop: 0 }}>
        <Pressable
          style={[styles.buttonCard, buttonColor]}
          onPress={handleRecord}
          disabled={isProcessing}
        >
          {isRecording ? (
            <Waveform />
          ) : (
            <Text style={styles.buttonText}>
              {isProcessing ? '...' : 'RECORD'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
