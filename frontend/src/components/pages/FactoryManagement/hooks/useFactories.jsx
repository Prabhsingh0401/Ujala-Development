import { useState, useEffect, useCallback } from 'react';
import { getFactories, addFactory, updateFactory, deleteFactory } from '../services/factoryService';

export const useFactories = () => {
    const [factories, setFactories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchFactories = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getFactories(searchTerm);
            setFactories(data);
        } catch (error) {
            // Error is already handled in the service
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const debounceSearch = setTimeout(() => {
            fetchFactories();
        }, 300);

        return () => clearTimeout(debounceSearch);
    }, [fetchFactories]);

    const handleAddFactory = async (factoryData) => {
        try {
            await addFactory(factoryData);
            fetchFactories();
            return true;
        } catch (error) {
            return false;
        }
    };

    const handleUpdateFactory = async (factoryId, factoryData) => {
        try {
            await updateFactory(factoryId, factoryData);
            fetchFactories();
            return true;
        } catch (error) {
            return false;
        }
    };

    const handleDeleteFactory = async (factoryId) => {
        try {
            await deleteFactory(factoryId);
            fetchFactories();
        } catch (error) {
            // Error is already handled in the service
        }
    };

    return {
        factories,
        loading,
        searchTerm,
        setSearchTerm,
        addFactory: handleAddFactory,
        updateFactory: handleUpdateFactory,
        deleteFactory: handleDeleteFactory,
        fetchFactories
    };
};
