package nl.sogyo.bikerbud;

import android.annotation.SuppressLint;
import android.content.Context;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Looper;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

public class SubmitFragment extends Fragment {

    private FragmentManager fm;
    private Context mContext;
    private TextView longitude;
    private TextView latitude;
    private LocationManager locationManager;
    public Location mlocation;
    private Criteria criteria;
    private Looper looper;
    private ArrayList<Location> waypoints;
    private boolean currentlyTracking;
    private TextView placeholder;


    public SubmitFragment() {

    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.fm = getFragmentManager();
        this.mContext = this.getContext();
        this.placeholder = new TextView(mContext);
        this.placeholder.setText(R.string.none);
        this.currentlyTracking = false;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.submit_fragment, container, false);
    }

    @SuppressLint("MissingPermission")
    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        LinearLayout waypointList = getView().findViewById(R.id.waypointlistholder);
        waypointList.addView(placeholder);
        Button trackingButton = getView().findViewById(R.id.trackbutton);
        Button submitButton = getView().findViewById(R.id.submitbutton);
        Button clearButton = getView().findViewById(R.id.cancelbutton);
        longitude = getView().findViewById(R.id.textlongitude);
        latitude = getView().findViewById(R.id.textlatitude);
        criteria = setCriteria();
        looper = null;
        waypoints = new ArrayList<Location>();
        locationManager = (LocationManager) getActivity().getSystemService(Context.LOCATION_SERVICE);
        trackingButton.setOnClickListener(v -> onTrackingButtonStart(trackingButton));
        submitButton.setOnClickListener(v-> onSubmitButtonClick());
        clearButton.setOnClickListener(v-> onClearButtonClick());
        locationManager.requestSingleUpdate(criteria, locationListener, looper);
    }

    @SuppressLint("MissingPermission")
    private void onTrackingButtonStart(Button v){
        this.currentlyTracking = true;
        v.setText(R.string.sub_stop);
        v.setOnClickListener(n -> onTrackingButtonStop(v));
        Button submitButton = getView().findViewById(R.id.submitbutton);
        Button clearButton = getView().findViewById(R.id.cancelbutton);
        submitButton.setOnClickListener(n -> onSubmitWhileTracking());
        clearButton.setOnClickListener(null);
        locationManager.requestLocationUpdates(10,0,criteria,locationListener,null);
    }

    private void onTrackingButtonStop(Button v){
        this.currentlyTracking = false;
        v.setText(R.string.sub_begin);
        v.setOnClickListener(n -> onTrackingButtonStart(v));
        Button submitButton = getView().findViewById(R.id.submitbutton);
        Button clearButton = getView().findViewById(R.id.cancelbutton);
        submitButton.setOnClickListener(n-> onSubmitButtonClick());
        clearButton.setOnClickListener(n -> onClearButtonClick());
        locationManager.removeUpdates(locationListener);
    }

    private void onClearButtonClick(){
        this.waypoints.clear();
        LinearLayout container = getView().findViewById(R.id.waypointlistholder);
        container.removeAllViews();
        container.addView(placeholder);
    }

    private void onSubmitWhileTracking(){
        LinearLayout container = getView().findViewById(R.id.waypointlistholder);
        TextView confirmation = new TextView(mContext);
        confirmation.setText(R.string.sub_while_track);
        confirmation.setTextColor(ContextCompat.getColor(mContext, R.color.bikercumquad));
        container.addView(confirmation);
    }

    private void onSubmitButtonClick(){
        RequestQueue queue = Volley.newRequestQueue(mContext);
        String url = ServerAddress.getAddress();
        String parameters = "/submit";
        JSONObject postData = new JSONObject();
        waypoints.size();
        try{
            postData.put("length",String.valueOf(waypoints.size()));
            JSONArray waypointsJSON = new JSONArray();
            for(Location waypoint : waypoints){
                JSONObject waypointJSON = new JSONObject();
                waypointJSON.put("long",waypoint.getLongitude());
                waypointJSON.put("lat",waypoint.getLatitude());
                waypointsJSON.put(waypointJSON);
            }
            postData.put("waypoints",waypointsJSON);
        } catch (JSONException e) {
            Log.d("JSONexception", getString(R.string.JSONexception));
        }
        JsonObjectRequest request = new JsonObjectRequest(
                Request.Method.POST,
                url+parameters,
                postData,
                r -> handleResponse(r),
                e -> handleError()
        );
        queue.add(request);
    }

    private void handleResponse(JSONObject response){
        System.out.println(response.toString());
        this.waypoints.clear();
        LinearLayout container = getView().findViewById(R.id.waypointlistholder);
        container.removeAllViews();
        TextView confirmation = new TextView(mContext);
        try {
            System.out.println("Entering try!");
            System.out.println(response.getInt("routeID"));
            String responseID = String.valueOf(response.getInt("routeID"));
            confirmation.setText(getResources().getString(R.string.sub_success)+responseID);
            confirmation.setTextColor(ContextCompat.getColor(mContext, R.color.bikercumquad));
            container.addView(confirmation);
        } catch (JSONException e) {
            handleError();
        }
    }

    private void handleError(){
        LinearLayout container = getView().findViewById(R.id.waypointlistholder);
        TextView confirmation = new TextView(mContext);
        confirmation.setText(R.string.sub_failure);
        confirmation.setTextColor(ContextCompat.getColor(mContext, R.color.bikercumquad));
        container.addView(confirmation);
    }

    private void displayWayPoints(){
        FragmentTransaction ft = fm.beginTransaction();
        try {
            LinearLayout container = getView().findViewById(R.id.waypointlistholder);
            container.removeAllViews();
            int waypointNum = 1;
            for (Location waypoint : this.waypoints) {
                displaySingleWayPoint(waypoint, container, waypointNum++);
            }
        } catch (NullPointerException e) {
            Log.d("viewupdate Interrupt", "Submit Fragment update through displayWayPoints interrupted.");
        }
        ft.commit();
    }

    private void displaySingleWayPoint(Location waypoint, LinearLayout container, int number){
        LinearLayout.LayoutParams params =
                new LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.WRAP_CONTENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT
                );

        LinearLayout element = new LinearLayout(mContext);
        element.setOrientation(LinearLayout.HORIZONTAL);
        params.setMargins(10,10,30,10);
        element.setLayoutParams(params);

        params.setMargins(0,0,30,0);

        TextView waypointNumber = new TextView(mContext);
        waypointNumber.setTextSize(16);
        waypointNumber.setText(String.valueOf(number));
        waypointNumber.setLayoutParams(params);

        LinearLayout waypointValues = new LinearLayout(mContext);
        waypointValues.setOrientation(LinearLayout.HORIZONTAL);

        LinearLayout subElementText = new LinearLayout(mContext);
        subElementText.setOrientation(LinearLayout.VERTICAL);
        TextView longitudeText = new TextView(mContext);
        TextView latitudeText = new TextView(mContext);
        longitudeText.setText(R.string.longitude);
        latitudeText.setText(R.string.latitude);
        subElementText.addView(longitudeText);
        subElementText.addView(latitudeText);
        subElementText.setLayoutParams(params);

        LinearLayout subElementValues = new LinearLayout(mContext);
        subElementValues.setOrientation(LinearLayout.VERTICAL);
        TextView longitudeVal = new TextView(mContext);
        TextView latitudeVal = new TextView(mContext);
        longitudeVal.setText(String.valueOf(waypoint.getLongitude()));
        latitudeVal.setText(String.valueOf(waypoint.getLatitude()));
        subElementValues.addView(longitudeVal);
        subElementValues.addView(latitudeVal);
        subElementValues.setLayoutParams(params);

        waypointValues.addView(subElementText);
        waypointValues.addView(subElementValues);

        element.addView(waypointNumber);
        element.addView(waypointValues);

        container.addView(element);
    }

    final LocationListener locationListener = new LocationListener() {
        @Override
        public void onLocationChanged(Location location) {
            mlocation = location;
            waypoints.add(location);
            FragmentTransaction ft = fm.beginTransaction();
            longitude.setText(String.valueOf(location.getLongitude()));
            latitude.setText(String.valueOf(location.getLatitude()));
            ft.commit();
            if(currentlyTracking){
                displayWayPoints();
            };
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

    private Criteria setCriteria() {
        Criteria crit = new Criteria();
        crit.setAccuracy(Criteria.ACCURACY_FINE);
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