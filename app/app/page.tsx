'use client';

import { Download, Smartphone, CheckCircle, Shield, Zap } from 'lucide-react';

export default function AppDownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Vertex</span>
          </div>
          <a 
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Smartphone className="w-4 h-4" />
          Android App Available
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Download Vertex
          <span className="block text-green-600 mt-2">for Android</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Watch, create, and earn with short-form videos. Get the full Vertex experience on your Android device.
        </p>

        {/* Download Button */}
        <div className="flex flex-col items-center gap-4">
          <a
            href="/vertex-app.apk"
            download="vertex-app.apk"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Download className="w-6 h-6" />
            Download APK (2.4 MB)
          </a>
          
          <p className="text-sm text-gray-500">
            Version 1.0.0 • Released April 1, 2026
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Smooth</h3>
            <p className="text-gray-600">
              Optimized for performance with seamless video playback and quick loading times.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure</h3>
            <p className="text-gray-600">
              Your data is protected with industry-standard security measures and encryption.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Full Features</h3>
            <p className="text-gray-600">
              Access all features including video upload, earnings tracking, and social interactions.
            </p>
          </div>
        </div>
      </section>

      {/* Installation Instructions */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Installation Instructions</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Enable Unknown Sources</h3>
                <p className="text-gray-600">
                  Go to Settings → Security → Enable "Install from Unknown Sources" or "Install Unknown Apps"
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Download the APK</h3>
                <p className="text-gray-600">
                  Click the download button above to download the Vertex APK file to your device
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Install the App</h3>
                <p className="text-gray-600">
                  Open the downloaded APK file and follow the on-screen instructions to install
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Launch & Enjoy</h3>
                <p className="text-gray-600">
                  Open Vertex from your app drawer and start watching, creating, and earning!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> This is a direct APK download. Google Play Protect may show a warning since the app is not from the Play Store. This is normal for apps distributed outside the Play Store.
            </p>
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Requirements</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Minimum Requirements</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Android 6.0 (API 23) or higher</li>
                <li>• 100 MB free storage space</li>
                <li>• Internet connection</li>
                <li>• Camera (for video upload)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Recommended</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Android 10 or higher</li>
                <li>• 2 GB RAM or more</li>
                <li>• Stable WiFi or 4G connection</li>
                <li>• HD camera for best quality</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-600">
          <p className="mb-2">© 2026 Vertex. All rights reserved.</p>
          <p className="text-sm">
            Need help? Contact us at{' '}
            <a href="mailto:support@vertex.app" className="text-green-600 hover:text-green-700">
              support@vertex.app
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
