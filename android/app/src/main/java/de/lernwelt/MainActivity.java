package de.lernwelt;

import android.app.Activity;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.util.Locale;

// Hülle für die Lernwelt: zeigt die Web-App bildschirmfüllend und liest mit der Stimme des Tablets vor.
public class MainActivity extends Activity {
    private static final String START = "https://abadour36-lang.github.io/lernwelt/";
    private static final String ERLAUBT = "abadour36-lang.github.io";
    private WebView web;
    private TextToSpeech tts;
    private volatile boolean ttsBereit = false;

    @Override
    protected void onCreate(Bundle zustand) {
        super.onCreate(zustand);
        web = new WebView(this);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // Sterne und Fortschritt speichern
        s.setMediaPlaybackRequiresUserGesture(false);
        tts = new TextToSpeech(this, status -> ttsBereit = status == TextToSpeech.SUCCESS);
        web.addJavascriptInterface(new Vorleser(), "Vorleser");
        // Nur unsere eigene Seite öffnen, keine fremden Links
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                String host = r.getUrl().getHost();
                return host == null || !host.equals(ERLAUBT);
            }
        });
        web.loadUrl(START);
    }

    class Vorleser {
        @JavascriptInterface
        public void sprich(String text, String sprache, float tempo) {
            if (!ttsBereit) return;
            String[] teile = sprache.split("-");
            tts.setLanguage(teile.length > 1 ? new Locale(teile[0], teile[1]) : new Locale(teile[0]));
            tts.setSpeechRate(tempo);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "lernwelt");
        }

        @JavascriptInterface
        public void stopp() {
            if (ttsBereit) tts.stop();
        }

        @JavascriptInterface
        public boolean bereit() {
            return ttsBereit;
        }
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack(); else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
