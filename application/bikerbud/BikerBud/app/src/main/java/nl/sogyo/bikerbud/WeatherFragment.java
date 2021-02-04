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
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

public class WeatherFragment extends Fragment {

    private FragmentManager fm;
    private LocationManager locationManager;
    private Context mContext;
    private Button locationgetbutton;
    private TextView longitude;
    private TextView latitude;
    public Location mlocation;
    private Criteria criteria;
    private Looper looper;

    public WeatherFragment() {
        // Required empty public constructor
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
        locationgetbutton = getView().findViewById(R.id.refreshbutton);
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
        locationgetbutton.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View v) {
                locationManager.requestSingleUpdate(criteria, locationListener, looper);
            }
        });
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

    private void requestWarnings(){
        boolean[] whichWarningsToDisplay = getWhichWarningsToDisplay(mlocation);
        for(int i=0; i<whichWarningsToDisplay.length; i++){
            if(whichWarningsToDisplay[i]){
                addWarning(i);
            }
        }
    }

    private boolean[] getWhichWarningsToDisplay(Location location){

    }

    private void addWarning(int i){

    }
}