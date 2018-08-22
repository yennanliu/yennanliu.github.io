
# Credit 

- https://www.kaggle.com/itratrahman/nlp-tutorial-using-python


```python

# OP 
import pandas as pd
import numpy as np
import time
from sklearn.preprocessing import LabelEncoder
from sklearn import preprocessing
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.model_selection import train_test_split, KFold
from nltk.corpus import stopwords
from nltk.stem.snowball import SnowballStemmer

%matplotlib inline
%pylab inline
import seaborn  as sns 
from matplotlib import pyplot
import matplotlib.pyplot as plt



# ML 

from sklearn.naive_bayes import GaussianNB, BernoulliNB, MultinomialNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, log_loss
from sklearn.model_selection import GridSearchCV
```

    Populating the interactive namespace from numpy and matplotlib



```python
# set plot style
matplotlib.style.use('fivethirtyeight')
matplotlib.rcParams['font.size'] = 12
matplotlib.rcParams['figure.figsize'] = (10,10)
```

## 0) Load data 


```python
# help fun 

def get_sentence_length(x):
    return len(x)

def remove_punctuation(text):
    '''a function for removing punctuation'''
    import string
    # replacing the punctuations with no space, 
    # which in effect deletes the punctuation marks 
    translator = str.maketrans('', '', string.punctuation)
    # return the text stripped of punctuation marks
    return text.translate(translator)


# stop words : show stop words in English 


def stopwords_(text):
    '''a function for removing the stopword'''
    # removing the stop words and lowercasing the selected words
    sw = stopwords.words('english')
    text = [word.lower() for word in text.split() if word.lower() not in sw]
    # joining the list of words with space separator
    return " ".join(text)


# create an object of stemming function
stemmer = SnowballStemmer("english")
def stemming(text):    
    '''a function which stems each word in the given text'''
    text = [stemmer.stem(word) for word in text.split()]
    return " ".join(text) 
```


```python
# LOAD THE DATA 

df = pd.read_csv('spam.csv', delimiter=',',encoding='latin-1')
df = df.loc[:,['v1','v2']]

# get feature

df['length'] = df['v2'].apply(get_sentence_length)
# remove punctuation
df['v2_del_punct'] = df['v2'].apply(remove_punctuation)
# remove stopwords
df['v2_del_stopword'] = df['v2'].apply(stopwords_)
# get stem
df['v2_stemming'] = df['v2'].apply(stemming)


df.head()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>v1</th>
      <th>v2</th>
      <th>length</th>
      <th>v2_del_punct</th>
      <th>v2_del_stopword</th>
      <th>v2_stemming</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>ham</td>
      <td>Go until jurong point, crazy.. Available only ...</td>
      <td>111</td>
      <td>Go until jurong point crazy Available only in ...</td>
      <td>go jurong point, crazy.. available bugis n gre...</td>
      <td>go until jurong point, crazy.. avail onli in b...</td>
    </tr>
    <tr>
      <th>1</th>
      <td>ham</td>
      <td>Ok lar... Joking wif u oni...</td>
      <td>29</td>
      <td>Ok lar Joking wif u oni</td>
      <td>ok lar... joking wif u oni...</td>
      <td>ok lar... joke wif u oni...</td>
    </tr>
    <tr>
      <th>2</th>
      <td>spam</td>
      <td>Free entry in 2 a wkly comp to win FA Cup fina...</td>
      <td>155</td>
      <td>Free entry in 2 a wkly comp to win FA Cup fina...</td>
      <td>free entry 2 wkly comp win fa cup final tkts 2...</td>
      <td>free entri in 2 a wkli comp to win fa cup fina...</td>
    </tr>
    <tr>
      <th>3</th>
      <td>ham</td>
      <td>U dun say so early hor... U c already then say...</td>
      <td>49</td>
      <td>U dun say so early hor U c already then say</td>
      <td>u dun say early hor... u c already say...</td>
      <td>u dun say so earli hor... u c alreadi then say...</td>
    </tr>
    <tr>
      <th>4</th>
      <td>ham</td>
      <td>Nah I don't think he goes to usf, he lives aro...</td>
      <td>61</td>
      <td>Nah I dont think he goes to usf he lives aroun...</td>
      <td>nah think goes usf, lives around though</td>
      <td>nah i don't think he goe to usf, he live aroun...</td>
    </tr>
  </tbody>
</table>
</div>



## 1) Data Overview


```python
# sentence length hist 

df.length.hist(bins=40)
plt.xlim(0,400)
plt.title('Sentence Length Histagram')
```




    Text(0.5,1,'Sentence Length Histagram')




![png](NLP_EDA_files/NLP_EDA_7_1.png)



```python
# sentence length hist  with spam V. ham

df[df.v1 == 'spam' ].length.hist(bins=40,alpha = 0.4)
df[df.v1 == 'ham' ].length.hist(bins=40,alpha = 0.4)
plt.xlim(0,400)
plt.title('Sentence Length Histagram : spam V. ham')
plt.legend(['spam','ham'])
plt.show()
```


![png](NLP_EDA_files/NLP_EDA_8_0.png)



```python
X = df.v2
Y = df.v1
le = LabelEncoder()
Y = le.fit_transform(Y)
```


```python
Y.shape
```




    (5572,)




```python
pd.DataFrame(Y)[0].value_counts()
```




    0    4825
    1     747
    Name: 0, dtype: int64




```python
X.iloc[0]
```




    'Go until jurong point, crazy.. Available only in bugis n great world la e buffet... Cine there got amore wat...'




```python
X.iloc[1]
```




    'Ok lar... Joking wif u oni...'



## 1) NLP feature extract 


```python
stopwords
```




    <WordListCorpusReader in '/Users/yennanliu/nltk_data/corpora/stopwords'>




```python
#print("Number of stopwords: ", len(sw))
```


```python
df.head()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>v1</th>
      <th>v2</th>
      <th>length</th>
      <th>v2_del_punct</th>
      <th>v2_del_stopword</th>
      <th>v2_stemming</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>ham</td>
      <td>Go until jurong point, crazy.. Available only ...</td>
      <td>111</td>
      <td>Go until jurong point crazy Available only in ...</td>
      <td>go jurong point, crazy.. available bugis n gre...</td>
      <td>go until jurong point, crazy.. avail onli in b...</td>
    </tr>
    <tr>
      <th>1</th>
      <td>ham</td>
      <td>Ok lar... Joking wif u oni...</td>
      <td>29</td>
      <td>Ok lar Joking wif u oni</td>
      <td>ok lar... joking wif u oni...</td>
      <td>ok lar... joke wif u oni...</td>
    </tr>
    <tr>
      <th>2</th>
      <td>spam</td>
      <td>Free entry in 2 a wkly comp to win FA Cup fina...</td>
      <td>155</td>
      <td>Free entry in 2 a wkly comp to win FA Cup fina...</td>
      <td>free entry 2 wkly comp win fa cup final tkts 2...</td>
      <td>free entri in 2 a wkli comp to win fa cup fina...</td>
    </tr>
    <tr>
      <th>3</th>
      <td>ham</td>
      <td>U dun say so early hor... U c already then say...</td>
      <td>49</td>
      <td>U dun say so early hor U c already then say</td>
      <td>u dun say early hor... u c already say...</td>
      <td>u dun say so earli hor... u c alreadi then say...</td>
    </tr>
    <tr>
      <th>4</th>
      <td>ham</td>
      <td>Nah I don't think he goes to usf, he lives aro...</td>
      <td>61</td>
      <td>Nah I dont think he goes to usf he lives aroun...</td>
      <td>nah think goes usf, lives around though</td>
      <td>nah i don't think he goe to usf, he live aroun...</td>
    </tr>
  </tbody>
</table>
</div>




```python
# Collect vocabulary count


# create a count vectorizer object
count_vectorizer = CountVectorizer()
# fit the count vectorizer using the text data
count_vectorizer.fit(df['v2_del_stopword'])
# collect the vocabulary items used in the vectorizer
dictionary = count_vectorizer.vocabulary_.items()

# lists to store the vocab and counts
vocab = []
count = []
# iterate through each vocab and count append the value to designated lists
for key, value in dictionary:
    vocab.append(key)
    count.append(value)
# store the count in panadas dataframe with vocab as index
vocab_bef_stem = pd.Series(count, index=vocab)
# sort the dataframe
vocab_bef_stem = vocab_bef_stem.sort_values(ascending=False)
```


```python
# plot top vacab.

top_vacab = vocab_bef_stem[20:40]
top_vacab.plot(kind = 'barh', figsize=(5,10), xlim= (0, 10000))
```




    <matplotlib.axes._subplots.AxesSubplot at 0x114c6d320>




![png](NLP_EDA_files/NLP_EDA_19_1.png)



```python
# stemming ops 
# run stemming operation 

print ('stemming words :  ')
print ('-'*10)
print ('')
print (df['v2_stemming'].head(5))
print ('-'*10)
print ('original words :  ')
df['v2'].head(5)
```

    stemming words :  
    ----------
    
    0    go until jurong point, crazy.. avail onli in b...
    1                          ok lar... joke wif u oni...
    2    free entri in 2 a wkli comp to win fa cup fina...
    3    u dun say so earli hor... u c alreadi then say...
    4    nah i don't think he goe to usf, he live aroun...
    Name: v2_stemming, dtype: object
    ----------
    original words :  





    0    Go until jurong point, crazy.. Available only ...
    1                        Ok lar... Joking wif u oni...
    2    Free entry in 2 a wkly comp to win FA Cup fina...
    3    U dun say so early hor... U c already then say...
    4    Nah I don't think he goes to usf, he lives aro...
    Name: v2, dtype: object




```python
#  TF-IDF Extraction : I 


"""


TF(t) = (Number of times term t appears in a document) / (Total number of terms in the document).

IDF(t) = log_e(Total number of documents / Number of documents with term t in it).

"""

# create the object of tfid vectorizer
EAP_tfid_vectorizer = TfidfVectorizer("english")
# fit the vectorizer using the text data
EAP_tfid_vectorizer.fit(df['v2_del_stopword'])
# collect the vocabulary items used in the vectorizer
EAP_dictionary = EAP_tfid_vectorizer.vocabulary_.items()

# lists to store the vocab and counts
vocab = []
count = []
# iterate through each vocab and count append the value to designated lists
for key, value in EAP_dictionary:
    vocab.append(key)
    count.append(value)
    
# store the count in panadas dataframe with vocab as index
EAP_vocab = pd.Series(count, index=vocab)
# sort the dataframe
EAP_vocab = EAP_vocab.sort_values(ascending=False)

print (EAP_vocab.head(5))
sns.distplot(EAP_vocab)

```

    ûówell     8649
    ûò         8648
    ûïharry    8647
    ûï         8646
    ûªve       8645
    dtype: int64


    /Users/yennanliu/anaconda3/envs/ds_dash/lib/python3.5/site-packages/matplotlib/axes/_axes.py:6462: UserWarning: The 'normed' kwarg is deprecated, and has been replaced by the 'density' kwarg.
      warnings.warn("The 'normed' kwarg is deprecated, and has been "





    <matplotlib.axes._subplots.AxesSubplot at 0x10b407f98>




![png](NLP_EDA_files/NLP_EDA_21_3.png)



```python
#  TF-IDF Extraction : II

from sklearn.feature_extraction.text import  TfidfVectorizer

```


```python
# create the object of tfid vectorizer
tfid_vectorizer = TfidfVectorizer("english")
# fit the vectorizer using the text data
tfid_vectorizer.fit(df['v2_stemming'])
# collect the vocabulary items used in the vectorizer
dictionary = tfid_vectorizer.vocabulary_.items()  
```


```python
# extract the tfid representation matrix of the text data
#tfid_vectorizer = TfidfVectorizer("english")
tfid_matrix = tfid_vectorizer.transform(df['v2'])
# collect the tfid matrix in numpy array
array = tfid_matrix.todense()
```


```python
array
```




    matrix([[ 0.,  0.,  0., ...,  0.,  0.,  0.],
            [ 0.,  0.,  0., ...,  0.,  0.,  0.],
            [ 0.,  0.,  0., ...,  0.,  0.,  0.],
            ..., 
            [ 0.,  0.,  0., ...,  0.,  0.,  0.],
            [ 0.,  0.,  0., ...,  0.,  0.,  0.],
            [ 0.,  0.,  0., ...,  0.,  0.,  0.]])




```python
# store the tf-idf array into pandas dataframe
df_vectorize = pd.DataFrame(array)
df_vectorize.head(10)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>0</th>
      <th>1</th>
      <th>2</th>
      <th>3</th>
      <th>4</th>
      <th>5</th>
      <th>6</th>
      <th>7</th>
      <th>8</th>
      <th>9</th>
      <th>...</th>
      <th>8172</th>
      <th>8173</th>
      <th>8174</th>
      <th>8175</th>
      <th>8176</th>
      <th>8177</th>
      <th>8178</th>
      <th>8179</th>
      <th>8180</th>
      <th>8181</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>5</th>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>6</th>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>7</th>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>8</th>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
    <tr>
      <th>9</th>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
    </tr>
  </tbody>
</table>
<p>10 rows × 8182 columns</p>
</div>




```python
shape(df_vectorize)
```




    (5572, 8182)




```python
shape(array)
```




    (5572, 8182)




```python
shape(df)
```




    (5572, 6)




```python
df.head(1)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>v1</th>
      <th>v2</th>
      <th>length</th>
      <th>v2_del_punct</th>
      <th>v2_del_stopword</th>
      <th>v2_stemming</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>ham</td>
      <td>Go until jurong point, crazy.. Available only ...</td>
      <td>111</td>
      <td>Go until jurong point crazy Available only in ...</td>
      <td>go jurong point, crazy.. available bugis n gre...</td>
      <td>go until jurong point, crazy.. avail onli in b...</td>
    </tr>
  </tbody>
</table>
</div>



## 2) Model 

### 2-1) MultinomialNB (multinomial Naive Bayes classifier)


```python
df_vectorize['v1'] = df['v1']
```


```python
features = df_vectorize.columns.tolist()
output = 'v1'
# removing the output and the id from features
features.remove(output)
```


```python
alpha_list1 = np.linspace(0.006, 0.1, 20)
alpha_list1 = np.around(alpha_list1, decimals=4)
alpha_list1

# parameter grid
parameter_grid = [{"alpha":alpha_list1}]
```


```python
parameter_grid
```




    [{'alpha': array([ 0.006 ,  0.0109,  0.0159,  0.0208,  0.0258,  0.0307,  0.0357,
              0.0406,  0.0456,  0.0505,  0.0555,  0.0604,  0.0654,  0.0703,
              0.0753,  0.0802,  0.0852,  0.0901,  0.0951,  0.1   ])}]




```python
# TRAIN 

# classifier object
classifier1 = MultinomialNB()
# gridsearch object using 4 fold cross validation and neg_log_loss as scoring paramter
gridsearch1 = GridSearchCV(classifier1,parameter_grid, scoring = 'neg_log_loss', cv = 4)
# fit the gridsearch
gridsearch1.fit(df_vectorize[features], df_vectorize[output])

```




    GridSearchCV(cv=4, error_score='raise',
           estimator=MultinomialNB(alpha=1.0, class_prior=None, fit_prior=True),
           fit_params=None, iid=True, n_jobs=1,
           param_grid=[{'alpha': array([ 0.006 ,  0.0109,  0.0159,  0.0208,  0.0258,  0.0307,  0.0357,
            0.0406,  0.0456,  0.0505,  0.0555,  0.0604,  0.0654,  0.0703,
            0.0753,  0.0802,  0.0852,  0.0901,  0.0951,  0.1   ])}],
           pre_dispatch='2*n_jobs', refit=True, return_train_score='warn',
           scoring='neg_log_loss', verbose=0)




```python
results1 = pd.DataFrame()
# collect alpha list
results1['alpha'] = gridsearch1.cv_results_['param_alpha'].data
# collect test scores
results1['neglogloss'] = gridsearch1.cv_results_['mean_test_score'].data
```


```python
matplotlib.rcParams['figure.figsize'] = (12.0, 6.0)
plt.plot(results1['alpha'], -results1['neglogloss'])
plt.xlabel('alpha')
plt.ylabel('logloss')
plt.title('Model : MultinomialNB ')

results1.T
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>0</th>
      <th>1</th>
      <th>2</th>
      <th>3</th>
      <th>4</th>
      <th>5</th>
      <th>6</th>
      <th>7</th>
      <th>8</th>
      <th>9</th>
      <th>10</th>
      <th>11</th>
      <th>12</th>
      <th>13</th>
      <th>14</th>
      <th>15</th>
      <th>16</th>
      <th>17</th>
      <th>18</th>
      <th>19</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>alpha</th>
      <td>0.006</td>
      <td>0.0109</td>
      <td>0.0159</td>
      <td>0.0208</td>
      <td>0.0258</td>
      <td>0.0307</td>
      <td>0.0357</td>
      <td>0.0406</td>
      <td>0.0456</td>
      <td>0.0505</td>
      <td>0.0555</td>
      <td>0.0604</td>
      <td>0.0654</td>
      <td>0.0703</td>
      <td>0.0753</td>
      <td>0.0802</td>
      <td>0.0852</td>
      <td>0.0901</td>
      <td>0.0951</td>
      <td>0.1</td>
    </tr>
    <tr>
      <th>neglogloss</th>
      <td>-0.0542484</td>
      <td>-0.0524873</td>
      <td>-0.0517779</td>
      <td>-0.0514898</td>
      <td>-0.0513987</td>
      <td>-0.0514207</td>
      <td>-0.0515115</td>
      <td>-0.0516433</td>
      <td>-0.0518067</td>
      <td>-0.0519863</td>
      <td>-0.0521835</td>
      <td>-0.0523867</td>
      <td>-0.0526016</td>
      <td>-0.0528178</td>
      <td>-0.0530429</td>
      <td>-0.0532672</td>
      <td>-0.0534991</td>
      <td>-0.0537291</td>
      <td>-0.0539662</td>
      <td>-0.0542007</td>
    </tr>
  </tbody>
</table>
</div>




![png](NLP_EDA_files/NLP_EDA_39_1.png)



```python
print("Best parameter: ",gridsearch1.best_params_)
print("Best score: ",gridsearch1.best_score_) 
```

    Best parameter:  {'alpha': 0.0258}
    Best score:  -0.0513987444724


## 2-2) Random forest


```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score,f1_score
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import train_test_split
from sklearn.model_selection import learning_curve
```


```python

def learn_curve(X,y,model):
        #df_train_2 = df_train_.head(10000)
        print ('model : ',model)
        # get train, test scores
        train_sizes, train_scores, test_scores = learning_curve(
                                                 model, X=X, y=y, 
                                                 cv=10, n_jobs=1, 
                                                 train_sizes=np.linspace(0.1,1,10))

        print ('train_sizes = ', train_sizes)
        #print ('train_scores = ', train_scores)
        #print ('test_scores = ', test_scores)
        # get mean, std 
        train_mean = np.mean(train_scores,axis = 1 )
        train_std = np.std(train_scores,axis = 1 )
        test_mean = np.mean(test_scores,axis = 1 )
        test_std = np.std(test_scores,axis = 1 )

        # plot 
        plt.plot(train_sizes,
                 train_mean,
                 color='blue', 
                 marker='o',
                 markersize=5,
                 label="training accuracy")
        # plot errors 
        plt.fill_between(train_sizes, 
                         train_mean + train_std , 
                         train_mean - train_std , 
                         alpha = 0.15,
                         color = 'blue',
                         label="training accuracy")


        plt.plot(train_sizes,
                 test_mean,
                 color='green',
                 linestyle='--' ,
                 marker='s',
                 markersize=5,
                 label="validation accuracy")

        plt.fill_between(train_sizes, 
                         test_mean + test_std , 
                         test_mean -  test_std , 
                         alpha = 0.15,
                         color = 'green',
                         label="validation accuracy")
        plt.grid()
        plt.xlabel('# of train sample')
        plt.ylabel('Accuracy')
        plt.legend(loc = "lower right")
        plt.ylim([0.1,1.2])
        plt.grid()
        plt.show()
```


```python
df_vectorize.head(1)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>0</th>
      <th>1</th>
      <th>2</th>
      <th>3</th>
      <th>4</th>
      <th>5</th>
      <th>6</th>
      <th>7</th>
      <th>8</th>
      <th>9</th>
      <th>...</th>
      <th>8173</th>
      <th>8174</th>
      <th>8175</th>
      <th>8176</th>
      <th>8177</th>
      <th>8178</th>
      <th>8179</th>
      <th>8180</th>
      <th>8181</th>
      <th>v1</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>ham</td>
    </tr>
  </tbody>
</table>
<p>1 rows × 8183 columns</p>
</div>




```python
d={'spam':1,'ham':0}
df_vectorize['v1_'] = list(map(lambda x:d[x],df_vectorize.v1))
```


```python
# mapping non-numerical lebel to numerical ones 
features = df_vectorize.columns.tolist()
output = 'v1'
output2 = 'v1_'
# removing the output and the id from features
features.remove(output)
features.remove(output2)
```


```python
# train - test split 
Xtrain, Xtest, ytrain, ytest = train_test_split(df_vectorize[features], df_vectorize[output2], test_size=0.2, random_state=1)
```


```python
Acc = {}
F1score = {}
confusion_mat={}
predictions = {}
name = 'RF'

RF = RandomForestClassifier(n_estimators =80,class_weight ='balanced')
RF.fit(Xtrain,ytrain)
pred = RF.predict(Xtest)
F1score[name]= f1_score(ytest,pred)
Acc[name] = accuracy_score(ytest,pred)
confusion_mat[name] = confusion_matrix(ytest,pred)
predictions[name]=pred
print(name+': Accuracy=%1.3f, F1=%1.3f'%(Acc[name],F1score[name]))  
```

    RF: Accuracy=0.988, F1=0.951



```python
learn_curve(Xtrain,ytrain,RF)
```

    model :  RandomForestClassifier(bootstrap=True, class_weight='balanced',
                criterion='gini', max_depth=None, max_features='auto',
                max_leaf_nodes=None, min_impurity_decrease=0.0,
                min_impurity_split=None, min_samples_leaf=1,
                min_samples_split=2, min_weight_fraction_leaf=0.0,
                n_estimators=80, n_jobs=1, oob_score=False, random_state=None,
                verbose=0, warm_start=False)
    train_sizes =  [ 401  802 1203 1604 2005 2406 2807 3208 3609 4011]



![png](NLP_EDA_files/NLP_EDA_49_1.png)

