import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score, confusion_matrix
import numpy as np
import joblib
import sys

# Load Data 
try:
    df_atp = pd.read_csv('atp.csv', low_memory=False)
    print(f"Loaded ATP data: {len(df_atp)} rows")

    # Display first few rows and columns to confirm correct loading and structure
    print("\nFirst 5 rows of the dataset:")
    print(df_atp.head())
    print("\nColumns in the dataset:")
    print(df_atp.columns.tolist())

except FileNotFoundError:
    print("Error: 'atp.csv' not found.")
    print("Please ensure the CSV file is uploaded and named correctly.")
    sys.exit(1)
except Exception as e:
    print(f"An error occurred while loading the CSV: {e}")
    sys.exit(1)

# Initial Data Cleaning & Preparation

# Convert 'Tour Name Date' to datetime objects for chronological splitting later
df_atp['Tourney Date'] = pd.to_datetime(df_atp['Date'], format='%Y-%m-%d')

# Handle missing ranks and points
# Strategy: Impute missing ranks with a value higher than any expected rank (e.g., 5000)
# and missing points with 0.
# Betting odds: fill with a neutral value (e.g., 1.9, implying even odds) if missing.
df_atp['Rank_1'].fillna(df_atp['Rank_1'].max() + 1000, inplace=True)
df_atp['Rank_2'].fillna(df_atp['Rank_2'].max() + 1000, inplace=True)
df_atp['Pts_1'].fillna(0, inplace=True)
df_atp['Pts_2'].fillna(0, inplace=True)
df_atp['Odd_1'].fillna(1.9, inplace=True)
df_atp['Odd_2'].fillna(1.9, inplace=True)

# Drop rows where 'Winner' is missing
df_atp.dropna(subset=['Winner'], inplace=True)

# Filter out matches where odds are exactly -1
df_atp = df_atp[df_atp['Odd_1'] != -1]
df_atp = df_atp[df_atp['Odd_2'] != -1]


# Feature Engineering

match_features = []

for index, row in df_atp.iterrows():
    # Features common to both player perspectives in this match
    common_feats = {
        'Surface': row['Surface'],
        'Round': row['Round'],
        'Best of': row['Best of'],
        'Tourney Date': row['Tourney Date'] # Keep for chronological splitting
    }

    # Perspective 1: Player_1 as 'P', Player_2 as 'OP'
    match_features.append({
        **common_feats,
        'P_Rank': row['Rank_1'],
        'OP_Rank': row['Rank_2'],
        'P_Pts': row['Pts_1'],
        'OP_Pts': row['Pts_2'],
        'P_Odd': row['Odd_1'],
        'OP_Odd': row['Odd_2'],
        'Winner_Is_P': 1 if row['Winner'] == row['Player_1'] else 0
    })

    # Perspective 2: Player_2 as 'P', Player_1 as 'OP' (Flipped)
    match_features.append({
        **common_feats,
        'P_Rank': row['Rank_2'],
        'OP_Rank': row['Rank_1'],
        'P_Pts': row['Pts_2'],
        'OP_Pts': row['Pts_1'],
        'P_Odd': row['Odd_2'],
        'OP_Odd': row['Odd_1'],
        'Winner_Is_P': 1 if row['Winner'] == row['Player_2'] else 0
    })

# Convert the list of feature dictionaries into a Pandas DataFrame
df_processed = pd.DataFrame(match_features)

# Positive if P has better rank
df_processed['Rank_Diff'] = df_processed['P_Rank'] - df_processed['OP_Rank']
# Positive if P has more points
df_processed['Pts_Diff'] = df_processed['P_Pts'] - df_processed['OP_Pts']

# Log odds ratio is often more stable for betting odds
# Add a small epsilon to avoid log(0) in case of extreme odds
df_processed['Odd_Ratio_Log'] = df_processed.apply(lambda r: np.log(r['P_Odd'] / r['OP_Odd']) if r['OP_Odd'] > 0 else np.nan, axis=1)
# Fill any NaN (if OP_Odd was zero) with 0 (neutral)
df_processed['Odd_Ratio_Log'].fillna(0, inplace=True) 

# Defining Features X and Target y
X = df_processed.drop([
    'Winner_Is_P', 'Tourney Date',
    'P_Rank', 'OP_Rank', 'P_Pts', 'OP_Pts', 'P_Odd', 'OP_Odd'
], axis=1)
y = df_processed['Winner_Is_P']

# Identify numerical and categorical features for the ColumnTransformer
numerical_features = X.select_dtypes(include=np.number).columns.tolist()
categorical_features = X.select_dtypes(include='object').columns.tolist()

# Create a preprocessing pipeline:
# Prevents errors if new categories appear in test/prediction data).
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

# Chronological Data Splitting
# Train on old data, test on new

# Sort the processed DataFrame by date to ensure chronological order
df_processed_sorted = df_processed.sort_values(by='Tourney Date').reset_index(drop=True)

# Select features X and target y from the sorted DataFrame
X_sorted = df_processed_sorted.drop([
    'Winner_Is_P', 'Tourney Date',
    'P_Rank', 'OP_Rank', 'P_Pts', 'OP_Pts', 'P_Odd', 'OP_Odd'
], axis=1)
y_sorted = df_processed_sorted['Winner_Is_P']

# Split date. Training data will be before 2024, testing data on/after.
split_date = pd.to_datetime('2024-01-01')

# Create training and testing sets based on the split date
X_train = X_sorted[df_processed_sorted['Tourney Date'] < split_date]
y_train = y_sorted[df_processed_sorted['Tourney Date'] < split_date]

X_test = X_sorted[df_processed_sorted['Tourney Date'] >= split_date]
y_test = y_sorted[df_processed_sorted['Tourney Date'] >= split_date]

print(f"\nTraining data shape: {X_train.shape}")
print(f"Testing data shape: {X_test.shape}")

# Emergency fallback for empty test set
if X_train.empty or y_train.empty:
    print("Error: Training data is empty. Cannot train the model. Check data loading and splitting.")
    sys.exit(1)
if X_test.empty or y_test.empty:
    print("Warning: Test set is empty after chronological split. Adjust `split_date` or ensure enough recent data.")
    print("Falling back to an 80/20 chronological percentage split for evaluation.")
    split_idx = int(len(X_sorted) * 0.8)
    X_train, X_test = X_sorted.iloc[:split_idx], X_sorted.iloc[split_idx:]
    y_train, y_test = y_sorted.iloc[:split_idx], y_sorted.iloc[split_idx:]
    print(f"Adjusted Training data shape: {X_train.shape}")
    print(f"Adjusted Testing data shape: {X_test.shape}")


# Train RandomForestClassifier Model
model = Pipeline(steps=[('preprocessor', preprocessor),
                        ('classifier', RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1))])

print("\nTraining the RandomForestClassifier model...")
model.fit(X_train, y_train)
print("Model training complete.")

# Evaluate the Model
if not X_test.empty:
    y_pred = model.predict(X_test)
    # Get probabilities for class 1 (Player P wins)
    y_proba = model.predict_proba(X_test)[:, 1]

    print(f"\n--- Model Evaluation on Test Set (Matches from {split_date.year} onwards) ---")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print(f"\nROC AUC Score: {roc_auc_score(y_test, y_proba):.4f}")
else:
    print("\nNo test data available for evaluation.")

# Trained model saved for future
joblib.dump(model, 'ao_head_to_head_predictor.pkl')
print("\nModel saved as 'ao_head_to_head_predictor.pkl'")


# Prediction for a Hypothetical 2026 Australian Open Final
print("\n--- Hypothetical 2026 Australian Open Men's Final Prediction ---")




# ------ TESTING HYPOTHETICAL FINAL HEAD TO HEAD ------ #


# Define hypothetical finalists and their *estimated* stats for 2026.
# Replace with actual players and their expected or current stats.
player_a_name = "Novak Djokovic"
player_b_name = "Carlos Alcaraz"

# Placeholder estimated stats for the 2026 Australian Open Final.
# You would ideally base these on their current form, age, trajectory, etc.
player_a_estimated_stats = {
    'Rank': 1,      # Lower rank is better (e.g., world No. 1)
    'Pts': 12000,   # Points example
    'Odd': 1.5      # Hypothetical betting odd for Player A to win this match
}

player_b_estimated_stats = {
    'Rank': 2,      
    'Pts': 10500,   # Points example
    'Odd': 2.2      # Hypothetical betting odd for Player B to win this match
}

# Match Context for the Australian Open Final
hypothetical_match_context = {
    'Surface': 'Hard', # Australian Open surface
    'Round': 'Final',  # Predicting a final match
    'Best of': 5       # Men's Grand Slam finals are typically Best of 5 sets
}

# DataFrame for single prediction.
hypothetical_final_data = pd.DataFrame([{
    'Surface': hypothetical_match_context['Surface'],
    'Round': hypothetical_match_context['Round'],
    'Best of': hypothetical_match_context['Best of'],
    'Rank_Diff': player_a_estimated_stats['Rank'] - player_b_estimated_stats['Rank'],
    'Pts_Diff': player_a_estimated_stats['Pts'] - player_b_estimated_stats['Pts'],
    # Calculate log odds ratio for prediction input, matching training feature
    'Odd_Ratio_Log': np.log(player_a_estimated_stats['Odd'] / player_b_estimated_stats['Odd'])
}])

# Make the prediction using the trained model
prediction_proba = model.predict_proba(hypothetical_final_data)[0]
proba_player_a_wins = prediction_proba[1] # Probability that Player A wins (class 1)
proba_player_b_wins = prediction_proba[0] # Probability that Player B wins (class 0)

print(f"\nHypothetical Final: {player_a_name} (Rank: {player_a_estimated_stats['Rank']}) vs. {player_b_name} (Rank: {player_b_estimated_stats['Rank']})")
print(f"Surface: {hypothetical_match_context['Surface']}, Round: {hypothetical_match_context['Round']}")
print(f"Predicted Probability of {player_a_name} winning: {proba_player_a_wins:.2%}")
print(f"Predicted Probability of {player_b_name} winning: {proba_player_b_wins:.2%}")

if proba_player_a_wins > proba_player_b_wins:
    print(f"\n**Predicted Winner of this Hypothetical Match: {player_a_name}**")
else:
    print(f"\n**Predicted Winner of this Hypothetical Match: {player_b_name}**")