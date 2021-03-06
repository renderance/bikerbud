package nl.sogyo.bikerbud;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentStatePagerAdapter;
import androidx.viewpager.widget.ViewPager;

import android.app.Activity;
import android.os.Bundle;

import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;

import com.mapquest.mapping.MapQuest;
import com.mapquest.mapping.maps.MapView;

import com.google.android.material.tabs.TabLayout;

public class MainActivity extends AppCompatActivity {

    //private MapView mMapView;
    //private MapboxMap mMapboxMap;


    private TabLayout tabLayout;

    private int[] tabIcons = {
            R.drawable.ic_weathertab,
            R.drawable.ic_exploretab,
            R.drawable.ic_submittab
    };
    private int[] tabLabels = {
            R.string.weathertab,
            R.string.exploretab,
            R.string.submittab
    };

    private void setupTabIcons() {
        tabLayout.getTabAt(0).setIcon(tabIcons[0]);
        tabLayout.getTabAt(1).setIcon(tabIcons[1]);
        tabLayout.getTabAt(2).setIcon(tabIcons[2]);
    }

    private void setupTabLabels() {
        tabLayout.getTabAt(0).setText(tabLabels[0]);
        tabLayout.getTabAt(1).setText(tabLabels[1]);
        tabLayout.getTabAt(2).setText(tabLabels[2]);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);//

        //MapQuest.start(getApplicationContext());

        setContentView(R.layout.activity_main);//

        /*
        mMapView = (MapView) findViewById(R.id.mapquestMapView);

        mMapView.onCreate(savedInstanceState);
        mMapView.getMapAsync(new OnMapReadyCallback() {
            @Override
            public void onMapReady(MapboxMap mapboxMap) {
                mMapboxMap = mapboxMap;
                mMapView.setStreetMode();
            }
        });
    }

        @Override
        public void onResume(){
            super.onResume();
            mMapView.onResume();
        }

        @Override
        public void onPause(){
            super.onPause();
            mMapView.onPause();
        }

        @Override
        protected void onDestroy(){
            super.onDestroy();
            mMapView.onDestroy();
        }

        @Override
        protected void onSaveInstanceState(Bundle outState){
            super.onSaveInstanceState(outState);
            mMapView.onSaveInstanceState(outState);
        }*/

        final ViewPager viewPager = findViewById(R.id.pager);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        tabLayout = findViewById(R.id.tab_layout);
        tabLayout.addTab(tabLayout.newTab());
        tabLayout.addTab(tabLayout.newTab());
        tabLayout.addTab(tabLayout.newTab());

        setupTabIcons();
        setupTabLabels();

        final PagerAdapter adapter = new PagerAdapter (getSupportFragmentManager(), tabLayout.getTabCount());
        viewPager.setAdapter(adapter);

        viewPager.addOnPageChangeListener(new TabLayout.TabLayoutOnPageChangeListener(tabLayout));

        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {

            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                viewPager.setCurrentItem(tab.getPosition());
            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {

            }

            @Override
            public void onTabReselected(TabLayout.Tab tab) {

            }
        });
    }

    public class PagerAdapter extends FragmentStatePagerAdapter {
        int mNumOfTabs;
        public PagerAdapter(FragmentManager fm, int NumOfTabs) {
            super(fm);
            this.mNumOfTabs = NumOfTabs;
        }

        @NonNull
        @Override
        public Fragment getItem(int position) {
            switch (position) {
                case 0:
                    return new WeatherFragment();
                case 1:
                    return new ExploreFragment();
                case 2:
                    return new SubmitFragment();
                default:
                    return null;
            }
        }

        @Override
        public int getCount() {
            return mNumOfTabs;
        }
    }
}