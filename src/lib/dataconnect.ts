import { getDataConnect, DataConnect } from 'firebase/data-connect';
import { connectorConfig } from '../generated/dataconnect';
import app from './firebase';

/**
 * Initialize and export the Data Connect client.
 */
export const dc: DataConnect = getDataConnect(app, connectorConfig);
