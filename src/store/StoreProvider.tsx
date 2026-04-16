'use client';

import { Provider } from 'react-redux';
import { store } from './index';

import { Toaster } from 'react-hot-toast';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            {children}
            <Toaster position="top-right" />
        </Provider>
    );
}
