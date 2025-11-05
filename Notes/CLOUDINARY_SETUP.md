# Cloudinary Setup Guide

## CORS Error Fix for Image Uploads

The CORS error you're experiencing is likely due to missing or incorrect Cloudinary configuration. Follow these steps to fix it:

### 1. Check Your Environment Variables

Make sure your `.env` file in the `admin` folder contains:

```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_here
```

### 2. Get Your Cloudinary Credentials

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Find your **Cloud Name** in the Account Details section
3. Go to **Settings > Upload > Upload presets**
4. Create a new upload preset with these settings:
   - **Preset name**: `your_preset_name`
   - **Signing Mode**: `Unsigned` (IMPORTANT!)
   - **Folder**: `your_folder_name` (optional)
   - **Resource Type**: `Image`
   - **Access Mode**: `Public`

### 3. Common Issues and Solutions

#### Issue: CORS Error
**Solution**: Make sure your upload preset is set to "Unsigned". Signed uploads require server-side implementation.

#### Issue: "Upload preset not found"
**Solution**: Double-check the preset name in your environment variables.

#### Issue: "Cloud name not found"
**Solution**: Verify your cloud name in the Cloudinary dashboard.

### 4. Test Your Configuration

The updated code now includes a test function that will log detailed information about your Cloudinary configuration. Check the browser console for:

- ✅ Cloudinary configuration looks good!
- Upload URL being used
- FormData contents
- Response status and headers

### 5. Alternative: Use Fetch Instead of Axios

If you still get CORS errors, try using the native `fetch` API instead of axios. The test function already uses fetch, which sometimes works better with Cloudinary.

### 6. Network/Firewall Issues

If the issue persists:
- Check if your firewall is blocking the request
- Try uploading from a different network
- Verify that `api.cloudinary.com` is accessible

### 7. Debug Steps

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try uploading an image
4. Look for the detailed logs from the test function
5. Check the Network tab for the actual request details

The updated code will now provide much better error messages and debugging information to help identify the exact issue.
