package nl.sogyo.bikerbud;

import android.content.Context;

public class WarningMaker {

    private Context context;

    public WarningMaker(Context mContext){
        this.context = mContext;
    }

    public int getError(int i){
        final int string = context.getResources().getIdentifier("werr_" + i, "string", context.getPackageName());
        return string;
    };

    public int getIcon(int i){
        System.out.println(context.getResources().getResourceName(i));
        switch (context.getResources().getResourceName(i)) {
            case "nl.sogyo.bikerbud:string/warn_2":
                return context.getResources().getIdentifier("ic_warn_ice", "drawable", context.getPackageName());
            case "nl.sogyo.bikerbud:string/warn_3":
            case "nl.sogyo.bikerbud:string/warn_8":
                return context.getResources().getIdentifier("ic_warn_rain","drawable",context.getPackageName());
            case "nl.sogyo.bikerbud:string/warn_4":
            case "nl.sogyo.bikerbud:string/warn_10":
                return context.getResources().getIdentifier("ic_warn_snow","drawable",context.getPackageName());
            case "nl.sogyo.bikerbud:string/warn_6":
                return context.getResources().getIdentifier("ic_warn_wind","drawable",context.getPackageName());
            case "nl.sogyo.bikerbud:string/warn_9":
                return context.getResources().getIdentifier("ic_warn_mist","drawable",context.getPackageName());
            case "nl.sogyo.bikerbud:string/warn_12":
                return context.getResources().getIdentifier("ic_warn_hot","drawable",context.getPackageName());
            case "nl.sogyo.bikerbud:string/warn_13":
                return context.getResources().getIdentifier("ic_warn_cold","drawable",context.getPackageName());
            default:
                return -1;
        }
    }

    public int getWarning(int i){
        final int string = context.getResources().getIdentifier("warn_" + i, "string", context.getPackageName());
        return string;
    };
}
