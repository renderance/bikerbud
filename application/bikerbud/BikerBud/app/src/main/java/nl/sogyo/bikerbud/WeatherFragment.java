package nl.sogyo.bikerbud;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Typeface;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Looper;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;

public class WeatherFragment extends Fragment {

    private final int[] textarray;
    private final int[] iconarray;
    private FragmentManager fm;
    private LocationManager locationManager;
    private Context mContext;
    private TextView longitude;
    private TextView latitude;
    public Location mlocation;
    private Criteria criteria;
    private Looper looper;
    private boolean[] whichWarningsToDisplay;

    public WeatherFragment() {
        // Required empty public constructor
        textarray = new int[]{
                R.string.warningerror,
                R.string.weatherwarn_sliding,
                R.string.weatherwarn_icy_roads,
                R.string.weatherwarn_wet_roads,
                R.string.weatherwarn_snowy_roads,
                R.string.weatherwarn_wind,
                R.string.weatherwarn_strong_wind,
                R.string.weatherwarn_visibility,
                R.string.weatherwarn_vis_rain,
                R.string.weatherwarn_vis_mist,
                R.string.weatherwarn_vis_snow,
                R.string.weatherwarn_temp,
                R.string.weatherwarn_hot,
                R.string.weatherwarn_cold,
                R.string.warningcommunicaterror,
                R.string.jsonerror
        };
        iconarray = new int[]{
                R.drawable.tabbackgroundselector,
                R.drawable.tabbackgroundselector,
                R.drawable.ic_warn_ice,
                R.drawable.ic_warn_rain,
                R.drawable.ic_warn_snow,
                R.drawable.tabbackgroundselector,
                R.drawable.ic_warn_wind,
                R.drawable.tabbackgroundselector,
                R.drawable.ic_warn_rain,
                R.drawable.ic_warn_mist,
                R.drawable.ic_warn_snow,
                R.drawable.tabbackgroundselector,
                R.drawable.ic_warn_hot,
                R.drawable.ic_warn_cold,
                R.drawable.tabbackgroundselector,
                R.drawable.tabbackgroundselector
        };
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        fm = getFragmentManager();
        mContext = this.getContext();
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        return inflater.inflate(R.layout.weather_fragment, container, false);
    }

    @SuppressLint("MissingPermission")
    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState){
        Button locationgetbutton = getView().findViewById(R.id.refreshbutton);
        longitude = getView().findViewById(R.id.textlongitude);
        latitude = getView().findViewById(R.id.textlatitude);
        criteria = new Criteria();
        criteria.setAccuracy(Criteria.ACCURACY_COARSE);
        criteria.setPowerRequirement(Criteria.POWER_LOW);
        criteria.setAltitudeRequired(false);
        criteria.setBearingRequired(false);
        criteria.setSpeedRequired(false);
        criteria.setCostAllowed(true);
        criteria.setHorizontalAccuracy(Criteria.ACCURACY_HIGH);
        criteria.setVerticalAccuracy(Criteria.ACCURACY_HIGH);
        looper = null;
        locationManager = (LocationManager) getActivity().getSystemService(Context.LOCATION_SERVICE);
        locationgetbutton.setOnClickListener(v -> locationManager.requestSingleUpdate(criteria, locationListener, looper));
        locationManager.requestSingleUpdate(criteria, locationListener, looper);
    }

    final LocationListener locationListener = new LocationListener(){
        @Override
        public void onLocationChanged(Location location) {
            mlocation = location;
            FragmentTransaction ft = fm.beginTransaction();
            longitude.setText(String.valueOf(location.getLongitude()));
            latitude.setText(String.valueOf(location.getLatitude()));
            requestWarnings();
            ft.commit();
        }

        @Override
        public void onStatusChanged(String provider, int status, Bundle extras) {
            Log.d("Status Changed", String.valueOf(status));
        }

        @Override
        public void onProviderEnabled(String provider) {
            Log.d("Provider Enabled", provider);
        }

        @Override
        public void onProviderDisabled(String provider) {
            Log.d("Provider Disabled", provider);
        }
    };

    private void requestWarnings() {
        whichWarningsToDisplay = new boolean[]{
                true,
                false, false, false, false, false, false, false, false, false, false, false, false, false,
                false, false
        };
        RequestQueue queue = Volley.newRequestQueue(mContext);
        ServerAddress address = new ServerAddress();
        String url = address.getAddress();
        String parameters = "?"
                + "long=" + mlocation.getLongitude()
                + "&"
                + "lat=" + mlocation.getLatitude();
        StringRequest request = new StringRequest(Request.Method.GET, url + parameters, response -> {
            try {
                JSONObject warningsJson = new JSONObject(response);
                JSONArray warningsArray = warningsJson.getJSONArray("warnings");
                for(int i =0; i<warningsArray.length();i++){
                    whichWarningsToDisplay[i]=warningsArray.getBoolean(i);
                }
                displayWarnings(whichWarningsToDisplay);
            } catch (JSONException e) {
                whichWarningsToDisplay[0] = false;
                whichWarningsToDisplay[15] = true;
                displayWarnings(whichWarningsToDisplay);
            }
        }, error -> {
            whichWarningsToDisplay[0] = false;
            whichWarningsToDisplay[14] = true;
            displayWarnings(whichWarningsToDisplay);
        });
        queue.add(request);
    }

    private void displayWarnings(boolean[] whichWarningsToDisplay){
        LinearLayout container = getView().findViewById(R.id.warningcontainer);
        container.removeAllViews();
        for(int i=0; i<whichWarningsToDisplay.length; i++){
            if(whichWarningsToDisplay[i]){
                addWarning(i);
            }
        }
    }

    private void addWarning(int i) {
        LinearLayout thisWarning = new LinearLayout(mContext);
        LinearLayout container = getView().findViewById(R.id.warningcontainer);
        thisWarning.setOrientation(LinearLayout.HORIZONTAL);
        TextView text = new TextView(mContext);
        text.setText(textarray[i]);
        text.setTextSize(18);
        if(i!=0 && i!=1 && i!=5 && i!=7 && i!=11 && i!=14){
            ImageView icon = new ImageView(mContext);
            icon.setImageResource(iconarray[i]);
            icon.setScaleType(ImageView.ScaleType.FIT_CENTER);
            thisWarning.addView(icon);
            icon.setPadding(10,10,40,10);
            text.setGravity(Gravity.CENTER);
        } else {
            text.setTypeface(null, Typeface.BOLD);
        }
        thisWarning.addView(text);
        container.addView(thisWarning);
    }
}