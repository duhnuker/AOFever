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
    df_wta = pd.read_csv('wta.csv', low_memory=False)
    print(f"Loaded WTA data: {len(df_wta)} rows")

    # Confirm correct loading and structure
    print("\nFirst 5 rows of the dataset:")
    print(df_wta.head())
    print("\nColumns in the dataset:")
    print(df_wta.columns.tolist())

except FileNotFoundError:
    print("Error: 'wta.csv' not found.")
    print("Please ensure the CSV file is uploaded and named correctly.")
    sys.exit(1)
except Exception as e:
    print(f"An error occurred while loading the CSV: {e}")
    sys.exit(1)

# Initial Data Cleaning & Preparation
# Few date issues in csv, clean them
print("\nCleaning date data...")
df_wta['Date'] = df_wta['Date'].astype(str)

print(f"Rows before date cleaning: {len(df_wta)}")
df_wta = df_wta[~df_wta['Date'].str.contains('-1|nan|NaN|null|None', na=False, case=False)]
print(f"Rows after removing problematic dates: {len(df_wta)}")

# Convert to datetime with error handling
try:
    # Try original format first
    df_wta['Tourney Date'] = pd.to_datetime(df_wta['Date'], format='%Y-%m-%d', errors='coerce')
except:
    # Else more flexible approach
    df_wta['Tourney Date'] = pd.to_datetime(df_wta['Date'], errors='coerce')

# Remove rows where date conversion failed
initial_rows = len(df_wta)
df_wta = df_wta.dropna(subset=['Tourney Date'])
print(f"Rows after removing invalid dates: {len(df_wta)} (removed {initial_rows - len(df_wta)} rows)")

if len(df_wta) == 0:
    print("Error: No valid data remaining after date cleaning.")
    sys.exit(1)

# Handle missing ranks and points
# Strategy: Impute missing ranks with a value higher than any expected rank (e.g., 5000)
# and missing points with 0.
# Betting odds: fill with a neutral value (e.g., 1.9, implying even odds) if missing.
print("Handling missing values...")

# Handle missing or invalid ranks and points
df_wta['Rank_1'] = pd.to_numeric(df_wta['Rank_1'], errors='coerce')
df_wta['Rank_2'] = pd.to_numeric(df_wta['Rank_2'], errors='coerce')
df_wta['Pts_1'] = pd.to_numeric(df_wta['Pts_1'], errors='coerce')
df_wta['Pts_2'] = pd.to_numeric(df_wta['Pts_2'], errors='coerce')
df_wta['Odd_1'] = pd.to_numeric(df_wta['Odd_1'], errors='coerce')
df_wta['Odd_2'] = pd.to_numeric(df_wta['Odd_2'], errors='coerce')

# Fill missing values
max_rank = df_wta[['Rank_1', 'Rank_2']].max().max()
if pd.isna(max_rank):
    max_rank = 1000  # fallback value

df_wta['Rank_1'].fillna(max_rank + 1000, inplace=True)
df_wta['Rank_2'].fillna(max_rank + 1000, inplace=True)
df_wta['Pts_1'].fillna(0, inplace=True)
df_wta['Pts_2'].fillna(0, inplace=True)
df_wta['Odd_1'].fillna(1.9, inplace=True)
df_wta['Odd_2'].fillna(1.9, inplace=True)

# Drop rows where 'Winner' is missing
df_wta.dropna(subset=['Winner'], inplace=True)

# Filter out matches where odds are exactly -1
df_wta = df_wta[df_wta['Odd_1'] != -1]
df_wta = df_wta[df_wta['Odd_2'] != -1]

print(f"Final dataset size after cleaning: {len(df_wta)} rows")

# Feature Engineering
print("Creating features...")

match_features = []

for index, row in df_wta.iterrows():
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

# Positive if P has better rank (lower number = better rank)
df_processed['Rank_Diff'] = df_processed['OP_Rank'] - df_processed['P_Rank']
# Positive if P has more points
df_processed['Pts_Diff'] = df_processed['P_Pts'] - df_processed['OP_Pts']

# Log odds ratio is often more stable for betting odds
# Add a small epsilon to avoid log(0) in case of extreme odds
df_processed['Odd_Ratio_Log'] = df_processed.apply(
    lambda r: np.log(r['OP_Odd'] / r['P_Odd']) if r['P_Odd'] > 0 else np.nan, axis=1
)
# Fill any NaN (if P_Odd was zero) with 0 (neutral)
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

print(f"Numerical features: {numerical_features}")
print(f"Categorical features: {categorical_features}")

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

# Save the trained model for future use
joblib.dump(model, 'ao_womens_head_to_head_predictor.pkl')
print("\nModel saved as 'ao_womens_head_to_head_predictor.pkl'")
