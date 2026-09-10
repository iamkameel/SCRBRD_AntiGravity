import { getDataConnect, DataConnect, connectDataConnectEmulator } from 'firebase/data-connect';
import { connectorConfig } from '../generated/dataconnect';
import app from './firebase';

/**
 * Initialize and export the Data Connect client.
 */
export const dc: DataConnect = getDataConnect(app, connectorConfig);

if (process.env.USE_EMULATOR === 'true') {
    console.log('Connecting to Firebase Data Connect Emulator on localhost:9399');
    connectDataConnectEmulator(dc, 'localhost', 9399);
}
