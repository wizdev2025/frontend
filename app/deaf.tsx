import { View, Pressable, Text, TextInput, ScrollView, Alert } from 'react-native';
import { styles, colors } from './styles';
import { useState } from 'react';
import { WhisperClient } from './whisperClient';
import Waveform from './Waveform';

export default function Deaf() {
  const [summaryOn, setSummaryOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'single' | 'split'>('single');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');

  const [client] = useState(() => new WhisperClient(
    (text) => setTranscript(text),
    (text) => setSummary(text)
  ));

  const handleRecord = async () => {
    if (isProcessing) return;

    if (!isRecording) {
      try {
        setIsProcessing(true);
        const mode = summaryOn ? 'split' : 'single';
        setRecordingMode(mode);
        setTranscript('The transcript will appear here');
        if (mode === 'split') {
          setSummary('The summary will appear here');
        }

        client.setPrompt(summaryOn ? 'summarize' : '');
        await client.startRecording();
        setIsRecording(true);
        setIsProcessing(false);
      } catch (error) {
        console.error('[Deaf] Recording failed:', error);
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
        console.error('[Deaf] Transcription failed:', error);
        Alert.alert('Transcription Failed', String(error));
        setIsRecording(false);
        setIsProcessing(false);
      }
    }
  };

  const showSplit = recordingMode === 'split';
  const buttonColor = isProcessing ? styles.buttonGray : {};

  return (
    <View style={styles.container}>
      <View style={{ flex: 0.25, padding: 10 }}>
        <Pressable
          style={[styles.inputCard, {
            flex: 1,
            backgroundColor: summaryOn ? colors.cerulean : colors.white,
            justifyContent: 'center',
            alignItems: 'center',
          }]}
          onPress={() => setSummaryOn(!summaryOn)}
          disabled={isRecording || isProcessing}
        >
          <Text style={[styles.buttonText, { color: summaryOn ? colors.white : colors.cerulean }]}>
            Summary: {summaryOn ? 'On' : 'Off'}
          </Text>
        </Pressable>
      </View>

      {showSplit ? (
        <View style={{ flex: 0.5, padding: 10, paddingTop: 0 }}>
          <View style={[styles.displayCard, { flex: 1 }]}>
            <ScrollView style={{ flex: 0.75, padding: 10 }}>
              <Text style={styles.text}>{summary}</Text>
            </ScrollView>
            <View style={{ height: 1, backgroundColor: colors.cerulean, marginHorizontal: 10 }} />
            <ScrollView style={{ flex: 0.25, padding: 10 }}>
              <Text style={styles.textSecondary}>{transcript}</Text>
            </ScrollView>
          </View>
        </View>
      ) : (
        <View style={{ flex: 0.5, padding: 10, paddingTop: 0 }}>
          <ScrollView style={[styles.displayCard, { flex: 1, padding: 10 }]}>
            <Text style={styles.text}>{transcript}</Text>
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
