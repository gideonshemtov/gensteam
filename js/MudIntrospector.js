// MudIntrospector.js - WebSocket interceptor with proper send replication
class MudIntrospector {
  constructor() {
    this.capturedWebSocket = null;
    this.originalWebSocketSend = null;
  }

  init() {
    console.log('🔍 MUD Introspector: Starting WebSocket interception...');
    this.interceptWebSocket();
    this.exposeDebugAPI();
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

  exposeDebugAPI() {
    const introspector = this;
    
    window.mudDebug = {
      // Direct send method (bypasses MUD client logic)
      directSend: (message) => {
        if (!introspector.capturedWebSocket || !introspector.originalWebSocketSend) {
          console.log('❌ No WebSocket captured or original send not available');
          return false;
        }
        
        try {
          console.log(`🚀 Direct WebSocket send: "${message}"`);
          introspector.originalWebSocketSend.call(introspector.capturedWebSocket, message);
          console.log('✅ Direct send successful');
          return true;
        } catch (error) {
          console.error('❌ Direct send failed:', error);
          return false;
        }
      },

      // MUD client compatible send (adds \n like the actual client)
      send: (message) => {
        if (!introspector.capturedWebSocket || !introspector.originalWebSocketSend) {
          console.log('❌ No WebSocket captured yet');
          return false;
        }
        
        try {
          console.log(`🧪 MUD client send: "${message}"`);
          const success = introspector.mudClientSend(message);
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
        console.log('  - WebSocket captured:', !!introspector.capturedWebSocket);
        console.log('  - Original send available:', !!introspector.originalWebSocketSend);
        if (introspector.capturedWebSocket) {
          console.log('  - WebSocket URL:', introspector.capturedWebSocket.url);
          console.log('  - WebSocket State:', introspector.capturedWebSocket.readyState);
          console.log('  - State meanings: 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED');
        }
        return {
          captured: !!introspector.capturedWebSocket,
          originalSendAvailable: !!introspector.originalWebSocketSend,
          readyState: introspector.capturedWebSocket?.readyState,
          url: introspector.capturedWebSocket?.url,
          mudClientBehavior: 'Adds \\n to each command and displays in output like the actual client'
        };
      },
      
      getWebSocket: () => {
        if (introspector.capturedWebSocket) {
          console.log('✅ Captured WebSocket:', introspector.capturedWebSocket);
          return introspector.capturedWebSocket;
        } else {
          console.log('❌ No WebSocket captured yet.');
          return null;
        }
      },

      // Test methods
      testConnection: () => {
        console.log('🔧 Testing connection...');
        console.log('Direct send test:', mudDebug.directSend('l'));
        console.log('MUD client send test:', mudDebug.send('l'));
      }
    };
    
    console.log('🛠️ Debug API exposed as window.mudDebug');
    console.log('Available commands:');
    console.log('  mudDebug.send("message") - Send like MUD client (adds \\n + shows in output)');
    console.log('  mudDebug.directSend("message") - Raw WebSocket send (no output display)');
    console.log('  mudDebug.status() - Show WebSocket status');
    console.log('  mudDebug.getWebSocket() - Get captured WebSocket');
    console.log('  mudDebug.testConnection() - Test both send methods');
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MudIntrospector;
}