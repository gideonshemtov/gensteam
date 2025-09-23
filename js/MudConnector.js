// MudConnector.js - WebSocket interceptor with proper send replication
class MudConnector {
  constructor() {
    this.capturedWebSocket = null;
    this.originalWebSocketSend = null;
  }

  init() {
    console.log('� MUD Connector: Starting WebSocket interception...');
    this.interceptWebSocket();
    this.exposeAPI();
  }

  interceptWebSocket() {
    console.log('Setting up WebSocket interception...');
    
    // Store the original send function before we modify it
    this.originalWebSocketSend = WebSocket.prototype.send;
    
    const self = this;
    WebSocket.prototype.send = function(data) {
      console.log('WebSocket send intercepted:', data);
      
      // Capture this WebSocket instance
      self.capturedWebSocket = this;
      console.log('Captured WebSocket instance');
      
      // Call the original send method to actually send the data
      return self.originalWebSocketSend.call(this, data);
    };
    
    console.log('WebSocket interception set up successfully');
  }

  // Replicate the MUD client's sending behavior
  mudClientSend(message) {
    if (!this.capturedWebSocket || !this.originalWebSocketSend) {
      return false;
    }

    // The MUD client adds \n to every command, as seen in the obfuscated code
    const messageWithNewline = message + '\n';
    
    try {
      // Add the command to output display (like the real client does)
      this.addCommandToOutput(message);
      
      // Send the command
      this.originalWebSocketSend.call(this.capturedWebSocket, messageWithNewline);
      return true;
    } catch (error) {
      console.error('Failed to send message via MUD client method:', error);
      return false;
    }
  }

  // Replicate how the MUD client displays sent commands in the output
  addCommandToOutput(message) {
    try {
      const outputContainer = document.querySelector('#mudoutput');
      if (!outputContainer) {
        console.warn('Could not find #mudoutput container');
        return;
      }

      // Create the command line element (similar to st.Line with outgoing: true)
      const commandDiv = document.createElement('div');
      commandDiv.className = 'line hanging-indent outgoing';
      commandDiv.textContent = message;
      
      // Add it to the output
      outputContainer.appendChild(commandDiv);
      
      // Scroll to bottom (like the real client does)
      outputContainer.scrollTop = outputContainer.scrollHeight;
      
      console.log(`📝 Added command to output: "${message}"`);
    } catch (error) {
      console.error('Failed to add command to output:', error);
    }
  }

  exposeAPI() {
    const connector = this;
    
    window.mudAPI = {
      // Direct send method (bypasses MUD client logic)
      directSend: (message) => {
        if (!connector.capturedWebSocket || !connector.originalWebSocketSend) {
          console.log('❌ No WebSocket captured or original send not available');
          return false;
        }
        
        try {
          console.log(`🚀 Direct WebSocket send: "${message}"`);
          connector.originalWebSocketSend.call(connector.capturedWebSocket, message);
          console.log('✅ Direct send successful');
          return true;
        } catch (error) {
          console.error('❌ Direct send failed:', error);
          return false;
        }
      },

      // MUD client compatible send (adds \n like the actual client)
      send: (message) => {
        if (!connector.capturedWebSocket || !connector.originalWebSocketSend) {
          console.log('❌ No WebSocket captured yet');
          return false;
        }
        
        try {
          console.log(`🧪 MUD client send: "${message}"`);
          const success = connector.mudClientSend(message);
          if (success) {
            console.log('✅ MUD client send successful (added to output)');
          }
          return success;
        } catch (error) {
          console.error('❌ MUD client send failed:', error);
          return false;
        }
      },
      
      status: () => {
        console.log('📊 WebSocket Status:');
        console.log('  - WebSocket captured:', !!connector.capturedWebSocket);
        console.log('  - Original send available:', !!connector.originalWebSocketSend);
        if (connector.capturedWebSocket) {
          console.log('  - WebSocket URL:', connector.capturedWebSocket.url);
          console.log('  - WebSocket State:', connector.capturedWebSocket.readyState);
          console.log('  - State meanings: 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED');
        }
        return {
          captured: !!connector.capturedWebSocket,
          originalSendAvailable: !!connector.originalWebSocketSend,
          readyState: connector.capturedWebSocket?.readyState,
          url: connector.capturedWebSocket?.url,
          mudClientBehavior: 'Adds \\n to each command and displays in output like the actual client'
        };
      },
      
      getWebSocket: () => {
        if (connector.capturedWebSocket) {
          console.log('✅ Captured WebSocket:', connector.capturedWebSocket);
          return connector.capturedWebSocket;
        } else {
          console.log('❌ No WebSocket captured yet.');
          return null;
        }
      },

      // Test methods
      testConnection: () => {
        console.log('🔧 Testing connection...');
        console.log('Direct send test:', mudAPI.directSend('l'));
        console.log('MUD client send test:', mudAPI.send('l'));
      }
    };
    
    console.log('🛠️ MUD API exposed as window.mudAPI');
    console.log('Available commands:');
    console.log('  mudAPI.send("message") - Send like MUD client (adds \\n + shows in output)');
    console.log('  mudAPI.directSend("message") - Raw WebSocket send (no output display)');
    console.log('  mudAPI.status() - Show WebSocket status');
    console.log('  mudAPI.getWebSocket() - Get captured WebSocket');
    console.log('  mudAPI.testConnection() - Test both send methods');
    console.log('🔗 ButtonPanel and TimerManager will automatically use mudAPI.send() when available!');
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MudConnector;
}