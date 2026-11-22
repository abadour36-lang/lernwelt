package de.lernwelt;

import android.app.Activity;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.Voice;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.json.JSONArray;

// Hülle für die Lernwelt: zeigt die Web-App bildschirmfüllend und liest mit der Stimme des Tablets vor.
public class MainActivity extends Activity {
    private static final String START = "https://abadour36-lang.github.io/lernwelt/";
    private static final String ERLAUBT = "abadour36-lang.github.io";
    private WebView web;
    private TextToSpeech tts;
    private volatile boolean ttsBereit = false;
    private volatile String wunsch = "";   // im Eltern-Bereich gewählte Stimme ("" = automatisch)
    // Namensteile weiblicher deutscher Stimmen (Amazon, Google, Samsung, Microsoft)
    private static final String[] WEIBLICH = {"marlene", "vicki", "anna", "petra", "katja", "amala", "helena", "hedda",
        "eva", "kerstin", "ramona", "sabine", "female", "weiblich", "frau", "-dea", "-deb", "-nfh", "-dfc"};

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
            Locale ort = teile.length > 1 ? new Locale(teile[0], teile[1]) : new Locale(teile[0]);
            tts.setLanguage(ort);
            Voice v = waehle(ort.getLanguage());
            if (v != null) tts.setVoice(v);
            tts.setPitch(1.1f);              // etwas heller und freundlicher
            tts.setSpeechRate(tempo);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "lernwelt");
        }

        @JavascriptInterface
        public void stopp() {
            if (ttsBereit) tts.stop();
        }

        @JavascriptInterface
        public void stimme(String name) {
            wunsch = name == null ? "" : name;
        }

        // Liste der installierten deutschen Stimmen für den Eltern-Bereich (weibliche zuerst)
        @JavascriptInterface
        public String stimmen() {
            JSONArray a = new JSONArray();
            for (Voice v : sortiert("de")) a.put(v.getName());
            return a.toString();
        }

        @JavascriptInterface
        public boolean bereit() {
            return ttsBereit;
        }
    }

    private static boolean weiblich(Voice v) {
        String n = v.getName().toLowerCase(Locale.ROOT);
        for (String w : WEIBLICH) if (n.contains(w)) return true;
        return n.contains("female");
    }

    private List<Voice> sortiert(String sprache) {
        List<Voice> liste = new ArrayList<>();
        try {
            for (Voice v : tts.getVoices()) {
                if (!v.getLocale().getLanguage().equals(new Locale(sprache).getLanguage())) continue;
                if (v.getFeatures() != null && v.getFeatures().contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED)) continue;
                liste.add(v);
            }
        } catch (Exception e) { return liste; }
        // weiblich vor männlich, ohne Internet vor mit Internet, beste Qualität zuerst
        liste.sort((x, y) -> {
            int a = Boolean.compare(weiblich(y), weiblich(x));
            if (a != 0) return a;
            a = Boolean.compare(x.isNetworkConnectionRequired(), y.isNetworkConnectionRequired());
            if (a != 0) return a;
            return Integer.compare(y.getQuality(), x.getQuality());
        });
        return liste;
    }

    private Voice waehle(String sprache) {
        List<Voice> liste = sortiert(sprache);
        if (liste.isEmpty()) return null;
        if (sprache.equals("de") && !wunsch.isEmpty())
            for (Voice v : liste) if (v.getName().equals(wunsch)) return v;
        return weiblich(liste.get(0)) ? liste.get(0) : null;   // keine weibliche gefunden: Standard des Tablets
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
