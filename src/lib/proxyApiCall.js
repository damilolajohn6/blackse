import useServiceProviderStore from "@/store/serviceStore";


// Base API call function
async function makeProxyCall(endpoint, options = {}) {
    const { method = "GET", body, params = {}, ...otherOptions } = options;
    
    // Build query string with path and params
    const queryParams = new URLSearchParams({ 
        path: endpoint, 
        ...params 
    }).toString();
    
    const config = {
        method,
        headers: { 
            "Content-Type": "application/json",
            ...otherOptions.headers
        },
        ...otherOptions,
    };
    
    // Only add body for methods that support it
    if (body && !["GET", "HEAD"].includes(method)) {
        config.body = JSON.stringify(body);
    }
    
    console.log(`Making ${method} request to: ${endpoint}`, { params, body });
    
    try {
        const res = await fetch(`/api/proxy?${queryParams}`, config);
        
        if (!res.ok) {
            // Try to get error message from response
            let errorMessage = `API Error: ${res.status}`;
            try {
                const errorData = await res.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
                
            }
            throw new Error(errorMessage);
        }
        
        const data = await res.json();
        console.log(`${method} ${endpoint} response:`, data);
        return data;
        
    } catch (error) {
        console.error(`API call failed for ${endpoint}:`, error);
        throw error;
    }
}

// Generic service functions
export async function apiCall(endpoint, options = {}) {
    return makeProxyCall(endpoint, options);
}

// Specific service functions with Zustand integration
export async function fetchConversations(params = {}) {
    try {
        const data = await makeProxyCall(`/service-provider/get-conversations`, { 
            method: "GET",
            params 
        });
        
        // Process and normalize conversation data
        const processedConversations = Array.isArray(data.conversations)
            ? data.conversations.map((conv) => ({
                ...conv,
                id: conv.id || conv._id, // Ensure consistent ID field
                unreadCount: conv.unreadCount || 0,
                lastMessage: conv.lastMessage || "No messages yet",
                lastMessageTime: conv.lastMessageTime || conv.updatedAt,
                members: Array.isArray(conv.members) ? conv.members : [],
                // Add any other default fields you need
            }))
            : [];
        
        // Update Zustand store
        const { setConversations } = useServiceProviderStore.getState();
        setConversations(processedConversations);
        
        console.log("Processed conversations:", processedConversations);
        
        // Return processed data
        return {
            ...data,
            conversations: processedConversations,
        };
        
    } catch (error) {
        console.error("Failed to fetch conversations:", error);
        // Optionally update store with error state
        const { setError } = useServiceProviderStore.getState();
        if (setError) {
            setError(`Failed to load conversations: ${error.message}`);
        }
        throw error;
    }
}

export async function addService(serviceData) {
    try {
        const data = await makeProxyCall("/service-provider/add-service-offered", {
            method: "POST",
            body: serviceData
        });
        
        console.log("DATA", data)
        
        return data.service;
        
    } catch (error) {
        console.error("Failed to add service:", error);
        throw error;
    }
}

export async function getUser(){
    try {
        const data = await makeProxyCall("/user/getuser", {
            method: "GET",
        });

        console.log("DATA", data)
        
        return data.service;
    } catch(error) {
        console.error("Failed to add service:", error);
        throw error;
    }
}

export async function updateService(serviceId, updateData) {
    try {
        const data = await makeProxyCall(`/services/${serviceId}`, {
            method: "PUT",
            body: updateData
        });
        
        // Update store
        const { updateService: updateInStore } = useServiceProviderStore.getState();
        if (updateInStore && data.service) {
            updateInStore(serviceId, data.service);
        }
        
        return data;
        
    } catch (error) {
        console.error("Failed to update service:", error);
        throw error;
    }
}

export async function deleteService(serviceId) {
    try {
        const data = await makeProxyCall(`/services/${serviceId}`, {
            method: "DELETE"
        });
        
        // Update store
        const { removeService } = useServiceProviderStore.getState();
        if (removeService) {
            removeService(serviceId);
        }
        
        return data;
        
    } catch (error) {
        console.error("Failed to delete service:", error);
        throw error;
    }
}

export async function fetchMessages(conversationId, params = {}) {
    try {
        const data = await makeProxyCall(`/conversations/${conversationId}/messages`, {
            method: "GET",
            params
        });
        
        // Process messages if needed
        const processedMessages = Array.isArray(data.messages)
            ? data.messages.map((msg) => ({
                ...msg,
                id: msg.id || msg._id,
                timestamp: msg.timestamp || msg.createdAt,
                isRead: msg.isRead || false,
            }))
            : [];
        
        // Update store
        const { setMessages } = useServiceProviderStore.getState();
        if (setMessages) {
            setMessages(conversationId, processedMessages);
        }
        
        return {
            ...data,
            messages: processedMessages,
        };
        
    } catch (error) {
        console.error("Failed to fetch messages:", error);
        throw error;
    }
}

export async function sendMessage(conversationId, messageData) {
    try {
        // Optimistically add message to store
        const tempMessage = {
            id: `temp-${Date.now()}`,
            ...messageData,
            timestamp: new Date().toISOString(),
            status: 'sending'
        };
        
        const { addMessage } = useServiceProviderStore.getState();
        if (addMessage) {
            addMessage(conversationId, tempMessage);
        }
        
        const data = await makeProxyCall(`/conversations/${conversationId}/messages`, {
            method: "POST",
            body: messageData
        });
        
        // Replace temp message with real message
        const { updateMessage } = useServiceProviderStore.getState();
        if (updateMessage && data.message) {
            updateMessage(conversationId, tempMessage.id, {
                ...data.message,
                status: 'sent'
            });
        }
        
        return data;
        
    } catch (error) {
        console.error("Failed to send message:", error);
        
        // Mark message as failed
        const { updateMessage } = useServiceProviderStore.getState();
        if (updateMessage) {
            updateMessage(conversationId, tempMessage.id, {
                ...tempMessage,
                status: 'failed'
            });
        }
        
        throw error;
    }
}

// Generic CRUD operations
export const crud = {
    get: (endpoint, params = {}) => makeProxyCall(endpoint, { method: "GET", params }),
    post: (endpoint, body) => makeProxyCall(endpoint, { method: "POST", body }),
    put: (endpoint, body) => makeProxyCall(endpoint, { method: "PUT", body }),
    patch: (endpoint, body) => makeProxyCall(endpoint, { method: "PATCH", body }),
    delete: (endpoint) => makeProxyCall(endpoint, { method: "DELETE" }),
};

// Utility function to handle loading states
export function withLoading(apiFunction) {
    return async (...args) => {
        const { setLoading } = useServiceProviderStore.getState();
        
        if (setLoading) setLoading(true);
        
        try {
            const result = await apiFunction(...args);
            return result;
        } finally {
            if (setLoading) setLoading(false);
        }
    };
}