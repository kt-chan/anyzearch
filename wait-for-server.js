import net from 'net';
const port = 3001; // The port your server is running on

const client = new net.Socket();

function checkServer() {
  client.connect(port, 'localhost', () => {
    console.log(`Server is ready on port ${port}`);
    client.end(); // Close the connection
    process.exit(); // Exit the script
  });
}

client.on('error', (err) => {
  console.log(`Error connecting to server: ${err.message}`);
  setTimeout(checkServer, 1000); // Try again after 1 second
});

checkServer();
