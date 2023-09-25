import React, { useEffect, useState } from 'react';
const messaging = (window as any).__onote.messaging;

function App() {
  useEffect(() => {
    const listener = (e, ...a) => {
      console.log(e, a)
      return setState(e);
    };
    messaging.receive("response", listener)
  }, [])

  const [state, setState] = useState<any>()

  return (
    <div>
      <h1>Hello Electron with React!</h1>
      <pre>{JSON.stringify(state, undefined, 2)}</pre>
      <button onClick={() => {
        console.log("Sending a message: Payload");
        messaging.send("message", {"payload": 1})
      }}>Send</button>
    </div>
  );
}

export default App;