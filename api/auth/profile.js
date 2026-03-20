import { supabase, requireAuth } from '../_utils.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'PUT') {
        const userToken = requireAuth(req, res);
        if (!userToken) return;

        try {
            const {
                username,
                firstName,
                lastName,
                email,
                address,
                city,
                postcode,
                country,
                phone,
                currentPassword,
                newPassword
            } = req.body;

            // Build update data object
            const updateData = {
                updated_at: new Date().toISOString()
            };

            // Add fields to update if provided
            if (username) updateData.username = username;
            if (firstName) updateData.first_name = firstName;
            if (lastName) updateData.last_name = lastName;
            if (email) updateData.email = email;
            if (address) updateData.address = address;
            if (city) updateData.city = city;
            if (postcode) updateData.postcode = postcode;
            if (country) updateData.country = country;
            if (phone) updateData.phone = phone;

            // Handle password change if requested
            if (currentPassword && newPassword) {
                // Get current user to verify password
                const { data: currentUser, error: fetchError } = await supabase
                    .from('users')
                    .select('password_hash')
                    .eq('id', userToken.id)
                    .single();

                if (fetchError || !currentUser) {
                    return res.status(404).json({ error: 'User not found' });
                }

                // Verify current password
                const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password_hash);
                if (!isPasswordValid) {
                    return res.status(400).json({ error: 'Current password is incorrect' });
                }

                if (newPassword.length < 6) {
                    return res.status(400).json({ error: 'New password must be at least 6 characters' });
                }

                // Hash new password
                updateData.password_hash = await bcrypt.hash(newPassword, 10);
            }

            // Update user in Supabase
            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', userToken.id)
                .select()
                .single();

            if (updateError || !updatedUser) {
                return res.status(500).json({ error: 'Failed to update profile' });
            }

            return res.json({
                message: 'Profile updated successfully',
                user: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    firstName: updatedUser.first_name || '',
                    lastName: updatedUser.last_name || '',
                    address: updatedUser.address || '',
                    city: updatedUser.city || '',
                    postcode: updatedUser.postcode || '',
                    country: updatedUser.country || 'United Kingdom',
                    phone: updatedUser.phone || ''
                }
            });
        } catch (error) {
            console.error('Profile update error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
