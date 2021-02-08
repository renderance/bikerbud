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

import com.android.volley.AuthFailureError;
import com.android.volley.NetworkError;
import com.android.volley.NoConnectionError;
import com.android.volley.ParseError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.ServerError;
import com.android.volley.TimeoutError;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class WeatherFragment extends Fragment {

    private WarningMaker wm;
    private FragmentManager fm;
    private LocationManager locationManager;
    private Context mContext;
    private TextView longitude;
    private TextView latitude;
    public Location mlocation;
    private Criteria criteria;
    private Looper looper;
    private boolean[] whichErrorsToDisplay;
    private boolean[] whichWarningsToDisplay;

    public WeatherFragment() {

    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.fm = getFragmentManager();
        this.mContext = this.getContext();
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        this.wm = new WarningMaker(mContext);
        return inflater.inflate(R.layout.weather_fragment, container, false);
    }

    @SuppressLint("MissingPermission")
    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        Button locationgetbutton = getView().findViewById(R.id.refreshbutton);
        longitude = getView().findViewById(R.id.textlongitude);
        latitude = getView().findViewById(R.id.textlatitude);
        criteria = setCriteria();
        looper = null;
        locationManager = (LocationManager) getActivity().getSystemService(Context.LOCATION_SERVICE);
        locationgetbutton.setOnClickListener(v -> locationManager.requestSingleUpdate(criteria, locationListener, looper));
        locationManager.requestSingleUpdate(criteria, locationListener, looper);
    }

    final LocationListener locationListener = new LocationListener() {
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

    private void requestWarnings(){
        whichWarningsToDisplay=new boolean[15];
        whichErrorsToDisplay=new boolean[8];
        RequestQueue queue = Volley.newRequestQueue(mContext);
        String url = ServerAddress.getAddress();
        String parameters = "?"
            + "long=" + mlocation.getLongitude()
            + "&"
            + "lat=" + mlocation.getLatitude();
        StringRequest request = new StringRequest(
            Request.Method.GET,
            url + parameters,
            r -> handleResponse(r),
            e -> handleError(e)
        );
        queue.add(request);
    }

    private void handleResponse(String response){
        try {
            JSONObject warningsJson = new JSONObject(response);
            JSONArray warningsArray = warningsJson.getJSONArray("warnings");
            for (int i = 0; i < warningsArray.length(); i++) {
                whichWarningsToDisplay[i] = warningsArray.getBoolean(i);
            }
            JSONObject errorsJson = new JSONObject(response);
            JSONArray errorsArray = errorsJson.getJSONArray("errors");
            for (int i = 0; i < errorsArray.length(); i++) {
                whichErrorsToDisplay[i] = errorsArray.getBoolean(i);
            }
        }
        catch(JSONException e){
            whichErrorsToDisplay[1]=false;
            whichErrorsToDisplay[4]=true;
        }
        displayElements(whichWarningsToDisplay, whichErrorsToDisplay);
    }

    private void handleError(VolleyError error){
        whichErrorsToDisplay[0]=true;
        if( error instanceof NetworkError) {
            whichErrorsToDisplay[1]=true;
        } else if( error instanceof ServerError) {
            whichErrorsToDisplay[2]=true;
        } else if( error instanceof AuthFailureError) {
            whichErrorsToDisplay[2]=true;
        } else if( error instanceof ParseError) {
            whichErrorsToDisplay[3]=true;
        } else if( error instanceof NoConnectionError) {
            whichErrorsToDisplay[1]=true;
        } else if( error instanceof TimeoutError) {
            whichErrorsToDisplay[1]=true;
        }
        displayElements(whichWarningsToDisplay,whichErrorsToDisplay);
    }

    private void displayElements(boolean[] warnings, boolean[] errors) {
        LinearLayout container = getView().findViewById(R.id.warningcontainer);
        container.removeAllViews();
        for (int i = 0; i < errors.length; i++) {
            if (errors[i]) {
                addElement(wm.getError(i), mContext, getView().findViewById(R.id.warningcontainer), i == 0, true);
            }
        }
        for (int i = 0; i < warnings.length; i++) {
            if (warnings[i]) {
                addElement(wm.getWarning(i), mContext, getView().findViewById(R.id.warningcontainer), i == 0, false);
            }
        }
    }

    private void addElement(int i, Context context, LinearLayout container, boolean isHeader, boolean isError) {
        LinearLayout element = new LinearLayout(context);
        element.setOrientation(LinearLayout.HORIZONTAL);
        TextView text = new TextView(context);
        ImageView icon = new ImageView(context);
        formatTextElement(i, context,text,isHeader,isError);
        formatIconElement(i, context,text,icon);
        element.addView(icon);
        element.addView(text);
        container.addView(element);
    }

    private void formatTextElement(int i, Context context,TextView text, boolean isHeader, boolean isError){
        text.setText(i);
        text.setTextSize(18);
        if(isHeader){
            text.setAllCaps(true);
            text.setTextSize(21);
            text.setPadding(0, 40, 0, 20);
        }
        else {
            text.setPadding(40, 10, 0, 10);
        }
        if(isError){
            text.setTextColor(context.getResources().getColor(R.color.bikercumquad));
        }
    }

    private void formatIconElement(int i, Context context, TextView text, ImageView iconview){
        int icon = wm.getIcon(i);
        if (icon != -1) {
            iconview.setImageResource(icon);
            iconview.setPadding(80, 10, 20, 10);
            text.setGravity(Gravity.CENTER);
        } else {
            text.setTypeface(null, Typeface.BOLD);
        }
    }

    private Criteria setCriteria() {
        Criteria crit = new Criteria();
        crit.setAccuracy(Criteria.ACCURACY_COARSE);
        crit.setPowerRequirement(Criteria.POWER_LOW);
        crit.setAltitudeRequired(false);
        crit.setBearingRequired(false);
        crit.setSpeedRequired(false);
        crit.setCostAllowed(true);
        crit.setHorizontalAccuracy(Criteria.ACCURACY_HIGH);
        crit.setVerticalAccuracy(Criteria.ACCURACY_HIGH);
        return crit;
    }
}